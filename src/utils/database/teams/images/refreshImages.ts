
import { supabase } from "@/integrations/supabase/client";
import { verifyImageExists } from "./verifyImage";
import { toast } from "sonner";

const extractPlayerIdFromFilename = (filename: string): string | null => {
  const playerIdMatch = filename.match(/playerid([^\.\_]+)/);
  return playerIdMatch ? playerIdMatch[1] : null;
};

/**
 * Synchronize image references between storage and database
 * Adds missing references and removes invalid ones
 */
export const synchronizeReferences = async (): Promise<{
  addedCount: number;
  removedCount: number;
  completed: boolean;
}> => {
  try {
    console.log("Démarrage de la synchronisation des références d'images");
    
    // 1. List all files in storage
    const { data: allFiles, error: listError } = await supabase
      .storage
      .from('player-images')
      .list('');
    
    if (listError) {
      console.error("Erreur lors de la liste des fichiers du bucket:", listError);
      toast.error("Impossible de lister les fichiers du bucket");
      return { addedCount: 0, removedCount: 0, completed: false };
    }
    
    console.log(`Trouvé ${allFiles?.length || 0} fichiers dans le bucket`);
    
    // 2. Get all players from database
    const { data: players, error: playerError } = await supabase
      .from('players')
      .select('playerid, image');
    
    if (playerError) {
      console.error("Erreur lors de la récupération des joueurs:", playerError);
      toast.error("Impossible de récupérer les joueurs");
      return { addedCount: 0, removedCount: 0, completed: false };
    }
    
    console.log(`Trouvé ${players?.length || 0} joueurs dans la base de données`);
    
    let addedCount = 0;
    let removedCount = 0;
    
    // 3. Synchronize files and database records
    for (const file of (allFiles || [])) {
      const playerId = extractPlayerIdFromFilename(file.name);
      
      if (playerId) {
        console.log(`Traitement du fichier ${file.name} pour joueur ${playerId}`);
        
        // Find corresponding player
        const player = players?.find(p => p.playerid === playerId);
        
        if (player) {
          // Create public URL for this file
          const { data: publicUrlData } = supabase
            .storage
            .from('player-images')
            .getPublicUrl(file.name);
          
          const publicUrl = publicUrlData?.publicUrl;
          
          // If player exists but has no image, update the reference
          if (!player.image && publicUrl) {
            console.log(`Mise à jour de la référence d'image pour joueur ${playerId}`);
            
            const { error: updateError } = await supabase
              .from('players')
              .update({ image: publicUrl })
              .eq('playerid', playerId);
            
            if (updateError) {
              console.error(`Erreur lors de la mise à jour de l'image pour ${playerId}:`, updateError);
            } else {
              console.log(`Image mise à jour pour joueur ${playerId}: ${publicUrl}`);
              addedCount++;
            }
          }
        } else {
          console.log(`Joueur ${playerId} non trouvé dans la base de données`);
        }
      } else {
        console.log(`Impossible d'extraire l'ID du joueur à partir du nom de fichier: ${file.name}`);
      }
    }
    
    // 4. Remove invalid image references from database
    for (const player of (players || [])) {
      if (player.image) {
        const isValid = await verifyImageExists(player.image);
        
        if (!isValid) {
          console.log(`Référence d'image invalide détectée pour joueur ${player.playerid}: ${player.image}`);
          
          const { error: clearError } = await supabase
            .from('players')
            .update({ image: null })
            .eq('playerid', player.playerid);
          
          if (clearError) {
            console.error(`Erreur lors de la suppression de la référence d'image pour ${player.playerid}:`, clearError);
          } else {
            console.log(`Référence d'image supprimée pour joueur ${player.playerid}`);
            removedCount++;
          }
        }
      }
    }
    
    console.log(`Synchronisation terminée: ${addedCount} références ajoutées, ${removedCount} références supprimées`);
    
    return { addedCount, removedCount, completed: true };
  } catch (error) {
    console.error("Erreur lors de la synchronisation:", error);
    toast.error("Erreur lors de la synchronisation des références");
    return { addedCount: 0, removedCount: 0, completed: false };
  }
};

/**
 * Refresh image references by verifying they still exist
 * and cleaning up invalid references
 */
export const refreshImageReferences = async (): Promise<{
  fixedCount: number;
  orphanedFilesCount: number;
  completed: boolean;
}> => {
  try {
    console.log("Démarrage de la vérification des références d'images");
    
    // 1. Get all players with images from database
    const { data: playersWithImages, error: playerError } = await supabase
      .from('players')
      .select('playerid, image')
      .not('image', 'is', null);
    
    if (playerError) {
      console.error("Erreur lors de la récupération des joueurs:", playerError);
      toast.error("Impossible de récupérer les joueurs");
      return { fixedCount: 0, orphanedFilesCount: 0, completed: false };
    }
    
    console.log(`Trouvé ${playersWithImages?.length || 0} joueurs avec des images à vérifier`);
    
    // 2. Get all files in storage
    const { data: allFiles, error: listError } = await supabase
      .storage
      .from('player-images')
      .list('');
    
    if (listError) {
      console.error("Erreur lors de la liste des fichiers du bucket:", listError);
      toast.error("Impossible de lister les fichiers du bucket");
      return { fixedCount: 0, orphanedFilesCount: 0, completed: false };
    }
    
    console.log(`Trouvé ${allFiles?.length || 0} fichiers dans le stockage`);
    
    let fixedCount = 0;
    let orphanedFilesCount = 0;
    
    // 3. Verify each image reference
    for (const player of (playersWithImages || [])) {
      if (player.image) {
        const isValid = await verifyImageExists(player.image);
        
        if (!isValid) {
          console.log(`Référence d'image invalide détectée pour joueur ${player.playerid}`);
          
          // Clear invalid reference
          const { error: clearError } = await supabase
            .from('players')
            .update({ image: null })
            .eq('playerid', player.playerid);
          
          if (!clearError) {
            console.log(`Référence d'image nettoyée pour joueur ${player.playerid}`);
            fixedCount++;
          }
        }
      }
    }
    
    // 4. Check for orphaned files
    if (allFiles && playersWithImages) {
      for (const file of allFiles) {
        const playerId = extractPlayerIdFromFilename(file.name);
        
        if (playerId && !playersWithImages.some(p => p.playerid === playerId)) {
          console.log(`Fichier orphelin détecté: ${file.name} (playerid: ${playerId})`);
          orphanedFilesCount++;
        }
      }
    }
    
    console.log(`Vérification terminée: ${fixedCount} références corrigées, ${orphanedFilesCount} fichiers orphelins détectés`);
    
    return { 
      fixedCount, 
      orphanedFilesCount, 
      completed: true 
    };
  } catch (error) {
    console.error("Erreur lors de la vérification des références d'images:", error);
    toast.error("Erreur lors de la vérification des références");
    return { fixedCount: 0, orphanedFilesCount: 0, completed: false };
  }
};
