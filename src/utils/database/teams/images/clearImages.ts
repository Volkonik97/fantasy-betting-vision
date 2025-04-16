
import { supabase } from "@/integrations/supabase/client";

/**
 * Clear an invalid image reference from a player
 * @param playerId The player ID to update
 * @returns Boolean indicating success
 */
export const clearInvalidImageReference = async (playerId: string): Promise<boolean> => {
  try {
    console.log(`Clearing image reference for player: ${playerId}`);
    
    // First, get the current image reference
    const { data: player, error: selectError } = await supabase
      .from('players')
      .select('image')
      .eq('playerid', playerId)
      .single();
    
    if (selectError) {
      console.error("Error getting player image:", selectError);
      return false;
    }
    
    // If the player has an image reference, try to delete it from storage
    if (player?.image) {
      try {
        // Extract filename from URL if it's a Supabase storage URL
        let filename = null;
        if (player.image.includes('player-images')) {
          const matches = player.image.match(/player-images\/([^?]+)/);
          if (matches && matches[1]) {
            filename = matches[1];
          } else if (!player.image.includes('/')) {
            // If it's just a filename without path separators
            filename = player.image;
          }
          
          if (filename) {
            console.log(`Attempting to delete file from storage: ${filename}`);
            const { error: deleteError } = await supabase
              .storage
              .from('player-images')
              .remove([filename]);
            
            if (deleteError) {
              console.warn(`Unable to delete file from storage: ${deleteError.message}`);
              // Continue even if file deletion fails
            } else {
              console.log(`Successfully deleted file from storage: ${filename}`);
            }
          }
        }
      } catch (storageError) {
        console.warn("Error during storage file deletion:", storageError);
        // Continue to update the database even if file deletion fails
      }
    }
    
    // Update the player record to clear the image reference
    const { error } = await supabase
      .from('players')
      .update({ image: null })
      .eq('playerid', playerId);
    
    if (error) {
      console.error("Error clearing image reference:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in clearInvalidImageReference:", error);
    return false;
  }
};

/**
 * Clear all player image references and optionally remove files from storage
 * @param deleteFromStorage Whether to also delete the files from storage
 * @returns Object with success status and count of cleared references
 */
export const clearAllPlayerImageReferences = async (deleteFromStorage: boolean = false): Promise<{ success: boolean, clearedCount: number }> => {
  try {
    // First, if we need to delete files from storage, get all player records with images
    if (deleteFromStorage) {
      console.log("Getting players with image references before clearing");
      const { data: playersWithImages, error: selectError } = await supabase
        .from('players')
        .select('playerid, image')
        .not('image', 'is', null);
      
      if (!selectError && playersWithImages && playersWithImages.length > 0) {
        console.log(`Found ${playersWithImages.length} players with images to remove from storage`);
        
        // Collect all filenames to delete from storage
        const filesToDelete: string[] = [];
        
        for (const player of playersWithImages) {
          if (player.image) {
            try {
              let filename = null;
              
              // Handle full URLs (extract filename)
              if (player.image.includes('player-images')) {
                const matches = player.image.match(/player-images\/([^?]+)/);
                if (matches && matches[1]) {
                  filename = matches[1];
                  console.log(`Extracted filename from URL: ${filename}`);
                }
              } 
              // Handle direct filenames
              else if (!player.image.includes('/') && !player.image.startsWith('http')) {
                filename = player.image;
                console.log(`Using direct filename: ${filename}`);
              }
              
              if (filename) {
                filesToDelete.push(filename);
              }
            } catch (e) {
              console.warn(`Could not process image URL for player ${player.playerid}: ${player.image}`);
            }
          }
        }
        
        if (filesToDelete.length > 0) {
          console.log(`Removing ${filesToDelete.length} files from player-images bucket`);
          
          // Delete files in batches to avoid hitting API limits
          const batchSize = 100;
          for (let i = 0; i < filesToDelete.length; i += batchSize) {
            const batch = filesToDelete.slice(i, i + batchSize);
            const { data: deleteData, error: deleteError } = await supabase
              .storage
              .from('player-images')
              .remove(batch);
            
            if (deleteError) {
              console.error(`Error deleting batch ${i / batchSize + 1}:`, deleteError);
            } else {
              console.log(`Successfully deleted batch ${i / batchSize + 1} (${batch.length} files)`);
            }
          }
        }
      } else if (selectError) {
        console.error("Error selecting players with images:", selectError);
      } else {
        console.log("No players with images found to delete from storage");
      }
    }
    
    // Now clear all image references in the database
    const { error } = await supabase
      .from('players')
      .update({ image: null })
      .not('image', 'is', null);
    
    if (error) {
      console.error("Error clearing all image references:", error);
      return { success: false, clearedCount: 0 };
    }
    
    // Get the count of affected rows
    const { count, error: countError } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true })
      .is('image', null);
    
    if (countError) {
      console.error("Error counting players after clearing images:", countError);
      return { success: true, clearedCount: 0 };
    }
    
    return { success: true, clearedCount: count || 0 };
  } catch (error) {
    console.error("Error clearing all image references:", error);
    return { success: false, clearedCount: 0 };
  }
};
