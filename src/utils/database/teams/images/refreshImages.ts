
import { supabase } from "@/integrations/supabase/client";
import { verifyImageExists } from "./verifyImage";
import { clearInvalidImageReference } from "./clearImages";
import { toast } from "sonner";
import { getPlayerImageFilename } from "./imageUtils";

/**
 * Attempts to match a storage filename to a player ID
 * @param filename The filename to analyze
 * @returns The player ID if a match is found, null otherwise
 */
const extractPlayerIdFromFilename = (filename: string): string | null => {
  // Match playerid123.ext or playerid123_somesuffix.ext
  const playerIdMatch = filename.match(/playerid([^\.\_]+)/);
  if (playerIdMatch && playerIdMatch[1]) {
    return playerIdMatch[1];
  }
  return null;
};

/**
 * Checks if an image in storage has a corresponding player in the database
 * @param filename The filename in storage
 * @param playersWithImages Array of players with image references
 * @returns boolean indicating if the file has a corresponding player
 */
const fileHasPlayerReference = (
  filename: string,
  playerIds: string[]
): boolean => {
  const playerId = extractPlayerIdFromFilename(filename);
  if (!playerId) return false;
  
  return playerIds.includes(playerId);
};

/**
 * Refreshes player image references by checking if they exist in storage 
 * and removing invalid ones. Also identifies orphaned files in storage.
 * @returns An object with the count of fixed references and completion status
 */
export const refreshImageReferences = async (): Promise<{ 
  fixedCount: number, 
  orphanedFilesCount: number,
  completed: boolean 
}> => {
  try {
    console.log("Démarrage de la vérification des références d'images");
    
    // 1. List all files in storage
    const { data: allFiles, error: listError } = await supabase
      .storage
      .from('player-images')
      .list('');
    
    if (listError) {
      console.error("Erreur lors de la liste des fichiers du bucket:", listError);
      toast.error("Erreur lors de la liste des fichiers du bucket");
      return { fixedCount: 0, orphanedFilesCount: 0, completed: false };
    }
    
    console.log(`Trouvé ${allFiles?.length || 0} fichiers dans le stockage`);
    
    // 2. Get all players with image references in database
    const { data: playersWithImages, error: selectError } = await supabase
      .from('players')
      .select('playerid, image')
      .not('image', 'is', null);
    
    if (selectError) {
      console.error("Erreur lors de la récupération des joueurs avec images:", selectError);
      toast.error("Erreur lors de la récupération des joueurs avec images");
      return { fixedCount: 0, orphanedFilesCount: 0, completed: false };
    }
    
    console.log(`Trouvé ${playersWithImages?.length || 0} joueurs avec références d'images dans la base de données`);
    
    // 3. Check database references that don't have files in storage
    let fixedCount = 0;
    
    // Create an array of all player IDs for faster lookup
    const allPlayerIds: string[] = playersWithImages ? playersWithImages.map(p => p.playerid) : [];
    const allFilenames: string[] = allFiles ? allFiles.map(f => f.name) : [];

    for (const player of (playersWithImages || [])) {
      if (!player.image) continue;
      
      // Check if the image exists in storage
      const imageExists = await verifyImageExists(player.image);
      
      if (!imageExists) {
        console.log(`Image invalide détectée pour le joueur ${player.playerid}: ${player.image}`);
        
        // Clear the invalid image reference
        const success = await clearInvalidImageReference(player.playerid);
        
        if (success) {
          fixedCount++;
          console.log(`Référence d'image supprimée pour le joueur ${player.playerid}`);
        } else {
          console.error(`Échec de la suppression de la référence d'image pour le joueur ${player.playerid}`);
        }
      }
    }
    
    // 4. Check for files in storage that don't have a corresponding player reference
    let orphanedFilesCount = 0;
    
    for (const file of (allFiles || [])) {
      if (!file.name) continue;
      
      // Check if this file corresponds to a player in the database
      const hasReference = fileHasPlayerReference(file.name, allPlayerIds);
      
      if (!hasReference) {
        console.log(`Fichier orphelin détecté dans le stockage: ${file.name}`);
        
        // Get player ID from filename if possible
        const playerId = extractPlayerIdFromFilename(file.name);
        
        if (playerId) {
          // Check if this player exists in the database but has no image reference
          const { data: player, error: playerError } = await supabase
            .from('players')
            .select('playerid, image')
            .eq('playerid', playerId)
            .single();
          
          if (!playerError && player && !player.image) {
            // Player exists but has no image reference, let's add it
            const { data: publicUrlData } = supabase
              .storage
              .from('player-images')
              .getPublicUrl(file.name);
            
            const publicUrl = publicUrlData?.publicUrl;
            
            if (publicUrl) {
              const { error: updateError } = await supabase
                .from('players')
                .update({ image: publicUrl })
                .eq('playerid', playerId);
              
              if (!updateError) {
                console.log(`Ajouté une référence d'image pour le joueur ${playerId}: ${publicUrl}`);
                continue;
              }
            }
          }
        }
        
        // If we get here, the file is truly orphaned (no player can use it)
        orphanedFilesCount++;
        
        // Optionally, we could delete orphaned files, but let's just count them for now
        // Uncomment the following lines to delete orphaned files
        /*
        const { error: deleteError } = await supabase
          .storage
          .from('player-images')
          .remove([file.name]);
        
        if (deleteError) {
          console.warn(`Impossible de supprimer le fichier orphelin: ${file.name}`);
        } else {
          console.log(`Fichier orphelin supprimé: ${file.name}`);
        }
        */
      }
    }
    
    console.log(`Vérification terminée. ${fixedCount} références d'images ont été supprimées. ${orphanedFilesCount} fichiers orphelins détectés.`);
    
    // 5. Refresh the UI counts by checking again
    // Get updated counts after all operations
    const { data: updatedPlayers } = await supabase
      .from('players')
      .select('playerid', { count: 'exact', head: true })
      .not('image', 'is', null);
    
    const updatedPlayerCount = updatedPlayers?.count || 0;
    
    const { data: updatedFiles } = await supabase
      .storage
      .from('player-images')
      .list('');
    
    const updatedFileCount = updatedFiles?.length || 0;
    
    console.log(`Après vérification: ${updatedFileCount} fichiers dans le stockage, ${updatedPlayerCount} joueurs avec références d'images`);
    
    return { 
      fixedCount, 
      orphanedFilesCount,
      completed: true 
    };
  } catch (error) {
    console.error("Erreur lors de la vérification des références d'images:", error);
    toast.error("Erreur lors de la vérification des références d'images");
    return { fixedCount: 0, orphanedFilesCount: 0, completed: false };
  }
};

/**
 * Synchronizes player references with existing files in storage
 * This is a more aggressive sync that will add missing references based on filenames
 * @returns The number of synchronized references
 */
export const synchronizeReferences = async (): Promise<{
  addedCount: number;
  removedCount: number;
  completed: boolean;
}> => {
  try {
    console.log("Démarrage de la synchronisation des références d'images");
    
    // 1. Get all files in storage
    const { data: allFiles, error: listError } = await supabase
      .storage
      .from('player-images')
      .list('');
    
    if (listError) {
      console.error("Erreur lors de la liste des fichiers du bucket:", listError);
      toast.error("Erreur lors de la liste des fichiers du bucket");
      return { addedCount: 0, removedCount: 0, completed: false };
    }
    
    // 2. Get all players (with and without images)
    const { data: allPlayers, error: playerError } = await supabase
      .from('players')
      .select('playerid, image');
    
    if (playerError) {
      console.error("Erreur lors de la récupération des joueurs:", playerError);
      toast.error("Erreur lors de la récupération des joueurs");
      return { addedCount: 0, removedCount: 0, completed: false };
    }
    
    let addedCount = 0;
    let removedCount = 0;
    
    // 3. Create mappings for faster lookups
    const playerMap = new Map<string, { hasImage: boolean, imageUrl: string | null }>();
    
    allPlayers?.forEach(player => {
      playerMap.set(player.playerid, { 
        hasImage: !!player.image, 
        imageUrl: player.image 
      });
    });
    
    // 4. For each file in storage, check if there's a matching player without image
    for (const file of (allFiles || [])) {
      const playerId = extractPlayerIdFromFilename(file.name);
      
      if (playerId) {
        const playerInfo = playerMap.get(playerId);
        
        if (playerInfo) {
          // Player exists - check if they need an image reference
          if (!playerInfo.hasImage) {
            // Generate public URL for this file
            const { data: publicUrlData } = supabase
              .storage
              .from('player-images')
              .getPublicUrl(file.name);
            
            const publicUrl = publicUrlData?.publicUrl;
            
            if (publicUrl) {
              // Update player with image reference
              const { error: updateError } = await supabase
                .from('players')
                .update({ image: publicUrl })
                .eq('playerid', playerId);
              
              if (!updateError) {
                console.log(`Ajouté une référence d'image pour le joueur ${playerId}: ${publicUrl}`);
                addedCount++;
              }
            }
          }
        }
      }
    }
    
    // 5. For each player with an image, check if the file exists
    for (const player of (allPlayers || [])) {
      if (player.image) {
        const imageExists = await verifyImageExists(player.image);
        
        if (!imageExists) {
          // Clear the invalid reference
          const success = await clearInvalidImageReference(player.playerid);
          
          if (success) {
            console.log(`Référence d'image invalide supprimée pour le joueur ${player.playerid}`);
            removedCount++;
          }
        }
      }
    }
    
    console.log(`Synchronisation terminée. ${addedCount} références ajoutées, ${removedCount} références supprimées.`);
    
    return { 
      addedCount, 
      removedCount, 
      completed: true 
    };
  } catch (error) {
    console.error("Erreur lors de la synchronisation des références d'images:", error);
    toast.error("Erreur lors de la synchronisation des références d'images");
    return { addedCount: 0, removedCount: 0, completed: false };
  }
};

