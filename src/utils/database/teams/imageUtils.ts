
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if an image URL is accessible in the Supabase storage
 * @param imageUrl The full URL of the image to check
 * @returns Boolean indicating if the image is accessible
 */
export const verifyImageExists = async (imageUrl: string): Promise<boolean> => {
  if (!imageUrl) return false;
  
  try {
    // Extract bucket name and path from the URL
    // Example URL format: https://{project-ref}.supabase.co/storage/v1/object/public/{bucket}/{path}
    const urlParts = imageUrl.split('/storage/v1/object/public/');
    if (urlParts.length !== 2) return false;
    
    const pathParts = urlParts[1].split('/');
    if (pathParts.length < 2) return false;
    
    const bucket = pathParts[0];
    const path = pathParts.slice(1).join('/');
    
    if (!bucket || !path) return false;
    
    console.log(`Verifying image in bucket: ${bucket}, path: ${path}`);
    
    // Use HEAD request instead of download to reduce bandwidth usage
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .createSignedUrl(path, 60); // Create a signed URL with 60 seconds expiry
    
    if (error) {
      console.error("Error checking image existence:", error);
      return false;
    }
    
    // If we successfully created a signed URL, the file exists
    return !!data;
  } catch (error) {
    console.error("Exception verifying image:", error);
    return false;
  }
};

/**
 * Clear invalid image reference for a specific player
 * @param playerId Player ID to clear image reference for
 * @returns Boolean indicating if operation was successful
 */
export const clearInvalidImageReference = async (playerId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('players')
      .update({ image: null })
      .eq('id', playerId);
    
    if (error) {
      console.error("Error clearing image reference:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exception clearing image reference:", error);
    return false;
  }
};

/**
 * Clear all player image references in the database
 * @returns Boolean indicating if operation was successful and count of cleared references
 */
export const clearAllPlayerImageReferences = async (): Promise<{ success: boolean, clearedCount: number }> => {
  try {
    // Get count of players with images before clearing
    const { count: beforeCount, error: countError } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true })
      .not('image', 'is', null);
    
    if (countError) {
      console.error("Error counting player images:", countError);
      return { success: false, clearedCount: 0 };
    }

    // Update all players to set image to null
    const { error: updateError } = await supabase
      .from('players')
      .update({ image: null })
      .not('image', 'is', null);
    
    if (updateError) {
      console.error("Error clearing all image references:", updateError);
      return { success: false, clearedCount: 0 };
    }
    
    return { 
      success: true, 
      clearedCount: beforeCount || 0
    };
  } catch (error) {
    console.error("Exception clearing all image references:", error);
    return { success: false, clearedCount: 0 };
  }
};

/**
 * Refresh image references in the database
 * @returns Number of fixed image references and a boolean indicating if operation completed
 */
export const refreshImageReferences = async (): Promise<{fixedCount: number, completed: boolean}> => {
  try {
    // Get all players with images
    const { data: players, error } = await supabase
      .from('players')
      .select('id, image')
      .not('image', 'is', null);
    
    if (error) {
      console.error("Error fetching players with images:", error);
      return {fixedCount: 0, completed: false};
    }
    
    if (!players || players.length === 0) return {fixedCount: 0, completed: true};
    
    let fixedCount = 0;
    
    // Check each player's image (limit to a reasonable batch size)
    const batchSize = 10; // Process players in smaller batches to avoid timeouts
    const playersToProcess = players.slice(0, batchSize);
    
    console.log(`Processing ${playersToProcess.length} player images out of ${players.length}`);
    
    for (const player of playersToProcess) {
      if (!player.image) continue;
      
      const exists = await verifyImageExists(player.image);
      
      if (!exists) {
        // Clear invalid image reference
        const success = await clearInvalidImageReference(player.id);
        if (success) fixedCount++;
      }
    }
    
    // Return whether we've processed all players
    const completed = playersToProcess.length === players.length;
    
    return {
      fixedCount,
      completed
    };
  } catch (error) {
    console.error("Exception refreshing image references:", error);
    return {fixedCount: 0, completed: false};
  }
};
