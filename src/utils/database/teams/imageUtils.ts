
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
    
    const [bucketAndPath] = urlParts[1].split('/', 1);
    const bucket = bucketAndPath;
    const path = urlParts[1].substring(bucket.length + 1);
    
    if (!bucket || !path) return false;
    
    // Check if file exists in storage
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .list('', {
        search: path
      });
    
    if (error) {
      console.error("Error checking image existence:", error);
      return false;
    }
    
    return data && data.some(file => file.name === path.split('/').pop());
  } catch (error) {
    console.error("Exception verifying image:", error);
    return false;
  }
};

/**
 * Clear invalid image references for a specific player
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
 * Refresh image references in the database
 * @returns Number of fixed image references
 */
export const refreshImageReferences = async (): Promise<number> => {
  try {
    // Get all players with images
    const { data: players, error } = await supabase
      .from('players')
      .select('id, image')
      .not('image', 'is', null);
    
    if (error) {
      console.error("Error fetching players with images:", error);
      return 0;
    }
    
    if (!players || players.length === 0) return 0;
    
    let fixedCount = 0;
    
    // Check each player's image
    for (const player of players) {
      if (!player.image) continue;
      
      const exists = await verifyImageExists(player.image);
      
      if (!exists) {
        // Clear invalid image reference
        const success = await clearInvalidImageReference(player.id);
        if (success) fixedCount++;
      }
    }
    
    return fixedCount;
  } catch (error) {
    console.error("Exception refreshing image references:", error);
    return 0;
  }
};
