
import { supabase } from "@/integrations/supabase/client";

/**
 * Clear an invalid image reference from a player
 * @param playerId The player ID to update
 * @returns Boolean indicating success
 */
export const clearInvalidImageReference = async (playerId: string): Promise<boolean> => {
  try {
    console.log(`Clearing image reference for player: ${playerId}`);
    
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
        
        // Get the list of files to delete from storage
        const filesToDelete: string[] = [];
        
        for (const player of playersWithImages) {
          if (player.image) {
            try {
              // Extract the filename from the full URL
              const imageUrl = new URL(player.image);
              const pathParts = imageUrl.pathname.split('/');
              // The last part of the path should be the filename
              const fileName = pathParts[pathParts.length - 1];
              
              if (fileName) {
                filesToDelete.push(fileName);
                console.log(`Added ${fileName} to deletion list for player ${player.playerid}`);
              }
            } catch (e) {
              console.warn(`Could not parse URL for player ${player.playerid}: ${player.image}`);
              // If the image is just a filename, add it directly
              if (!player.image.includes('/') && !player.image.startsWith('http')) {
                filesToDelete.push(player.image);
                console.log(`Added ${player.image} to deletion list (direct filename)`);
              }
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
    const { data, error } = await supabase
      .from('players')
      .update({ image: null })
      .neq('playerid', ''); // This is a condition that will apply to all players
    
    if (error) {
      console.error("Error clearing all image references:", error);
      return { success: false, clearedCount: 0 };
    }
    
    // Get the count of affected rows - we'll approximate with a count query
    const { count, error: countError } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true });
    
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
