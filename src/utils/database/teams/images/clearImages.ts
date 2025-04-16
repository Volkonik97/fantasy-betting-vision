
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Clear an invalid image reference from a player
 * @param playerId The player ID to update
 * @returns Boolean indicating success
 */
export const clearInvalidImageReference = async (playerId: string): Promise<boolean> => {
  try {
    console.log(`Suppression de la référence d'image pour le joueur: ${playerId}`);
    
    // First, get the current image reference
    const { data: player, error: selectError } = await supabase
      .from('players')
      .select('image')
      .eq('playerid', playerId)
      .single();
    
    if (selectError) {
      console.error("Erreur lors de la récupération de l'image du joueur:", selectError);
      return false;
    }
    
    // If the player has an image reference, try to delete it from storage
    if (player?.image) {
      try {
        // Extract filename from URL if it's a Supabase storage URL
        let filename = null;
        
        // Check if it's a standard player-images URL
        if (player.image.includes('player-images')) {
          const matches = player.image.match(/player-images\/([^?]+)/);
          if (matches && matches[1]) {
            filename = decodeURIComponent(matches[1]);
          }
        }
        
        // Check if it's just a filename without path separators
        if (!filename && !player.image.includes('/')) {
          filename = player.image;
        }
        
        // Check if it's a playerid-based filename
        if (!filename && player.image.includes(`playerid${playerId}`)) {
          const matches = player.image.match(/playerid[^\/]+\.\w+/);
          if (matches && matches[0]) {
            filename = matches[0];
          }
        }
        
        // Look for any file that might start with playerid{playerId}
        if (!filename) {
          const { data: files } = await supabase
            .storage
            .from('player-images')
            .list();
            
          if (files) {
            const playerFile = files.find(f => 
              f.name.startsWith(`playerid${playerId}.`) || 
              f.name.includes(`playerid${playerId}_`)
            );
            
            if (playerFile) {
              filename = playerFile.name;
            }
          }
        }
        
        if (filename) {
          console.log(`Tentative de suppression du fichier du stockage: ${filename}`);
          const { error: deleteError } = await supabase
            .storage
            .from('player-images')
            .remove([filename]);
          
          if (deleteError) {
            console.warn(`Impossible de supprimer le fichier du stockage: ${deleteError.message}`);
            // Continue even if file deletion fails
          } else {
            console.log(`Fichier supprimé du stockage avec succès: ${filename}`);
          }
        } else {
          console.warn(`Impossible d'extraire le nom de fichier de l'URL: ${player.image}`);
        }
      } catch (storageError) {
        console.warn("Erreur lors de la suppression du fichier du stockage:", storageError);
        // Continue updating database even if file deletion fails
      }
    }
    
    // Update player record to clear image reference
    const { error } = await supabase
      .from('players')
      .update({ image: null })
      .eq('playerid', playerId);
    
    if (error) {
      console.error("Erreur lors de la suppression de la référence d'image:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Erreur dans clearInvalidImageReference:", error);
    return false;
  }
};

/**
 * Clear all player image references and optionally remove files from storage
 * @param deleteFromStorage Whether to also delete the files from storage (optional, defaults to true)
 * @returns Object with success status and count of cleared references
 */
export const clearAllPlayerImageReferences = async (deleteFromStorage: boolean = true): Promise<{ success: boolean, clearedCount: number }> => {
  try {
    // Get all players with image references for reporting
    const { data: playersWithImages, error: countError } = await supabase
      .from('players')
      .select('playerid, image')
      .not('image', 'is', null);
    
    const playerCount = playersWithImages?.length || 0;
    console.log(`Trouvé ${playerCount} joueurs avec des références d'images à supprimer`);
    
    let filesToDelete: string[] = [];
    
    // First, list ALL files in the bucket
    if (deleteFromStorage) {
      try {
        const { data: allFiles, error: listError } = await supabase
          .storage
          .from('player-images')
          .list('');
        
        if (!listError && allFiles && allFiles.length > 0) {
          console.log(`Trouvé ${allFiles.length} fichiers dans le bucket player-images`);
          
          // Add all files to deletion list
          filesToDelete = allFiles.map(file => file.name);
          console.log(`Fichiers à supprimer: ${filesToDelete.length > 0 ? filesToDelete.slice(0, 5).join(', ') + '...' : 'aucun'}`);
        } else if (listError) {
          console.error("Erreur lors de la liste des fichiers du bucket:", listError);
          toast.error("Erreur lors de la liste des fichiers du bucket");
        } else {
          console.log("Aucun fichier trouvé dans le bucket player-images");
        }
      } catch (listError) {
        console.error("Exception lors de la liste des fichiers du bucket:", listError);
      }
    }
    
    // Delete files from storage in batches
    if (deleteFromStorage && filesToDelete.length > 0) {
      console.log(`Suppression de ${filesToDelete.length} fichiers du bucket player-images`);
      
      // Delete files in batches to avoid API limits
      const batchSize = 100;
      for (let i = 0; i < filesToDelete.length; i += batchSize) {
        const batch = filesToDelete.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(filesToDelete.length / batchSize);
        
        console.log(`Traitement du lot ${batchNumber}/${totalBatches}, ${batch.length} fichiers`);
        
        try {
          const { error: deleteError } = await supabase
            .storage
            .from('player-images')
            .remove(batch);
          
          if (deleteError) {
            console.error(`Erreur lors de la suppression du lot ${batchNumber}:`, deleteError);
            toast.error(`Erreur lors de la suppression des fichiers: ${deleteError.message}`);
          } else {
            console.log(`Lot ${batchNumber} supprimé avec succès (${batch.length} fichiers)`);
          }
        } catch (e) {
          console.error(`Exception lors de la suppression du lot ${batchNumber}:`, e);
        }
      }
    }
    
    // Check bucket status after deletion
    try {
      const { data: remainingFiles, error: checkError } = await supabase
        .storage
        .from('player-images')
        .list('');
      
      if (!checkError) {
        console.log(`Après suppression: ${remainingFiles?.length || 0} fichiers restants dans le bucket`);
        if (remainingFiles && remainingFiles.length > 0) {
          console.log("Fichiers restants:", remainingFiles.map(f => f.name).join(', '));
        }
      }
    } catch (e) {
      console.error("Erreur lors de la vérification des fichiers restants:", e);
    }
    
    // Clear all image references in database
    const { error: updateError } = await supabase
      .from('players')
      .update({ image: null })
      .not('image', 'is', null);
    
    if (updateError) {
      console.error("Erreur lors de la suppression des références d'images dans la DB:", updateError);
      return { success: false, clearedCount: 0 };
    }
    
    const totalDeleted = Math.max(playerCount, filesToDelete.length);
    
    return { 
      success: true, 
      clearedCount: totalDeleted
    };
  } catch (error) {
    console.error("Erreur lors de la suppression de toutes les références d'images:", error);
    return { success: false, clearedCount: 0 };
  }
};
