
import { verifyImageExists } from "./verifyImage";
import { clearInvalidImageReference } from "./clearImages";

/**
 * Refresh image references in the database
 * @returns Number of fixed image references and a boolean indicating if operation completed
 */
export const refreshImageReferences = async (): Promise<{fixedCount: number, completed: boolean}> => {
  try {
    // Import supabase directly here to avoid circular dependencies
    const { supabase } = await import("@/integrations/supabase/client");
    
    // Get all players with images - use safe query approach
    const { data: playersWithImages, error } = await supabase
      .from('players')
      .select('playerid, image')
      .not('image', 'is', null);
    
    if (error) {
      console.error("Error fetching players with images:", error);
      return {fixedCount: 0, completed: false};
    }
    
    if (!playersWithImages || playersWithImages.length === 0) {
      return {fixedCount: 0, completed: true};
    }
    
    let fixedCount = 0;
    
    // Process a reasonable batch size to avoid timeouts
    const batchSize = 10;
    const playersToProcess = playersWithImages.slice(0, batchSize);
    
    console.log(`Processing ${playersToProcess.length} player images out of ${playersWithImages.length}`);
    
    for (const player of playersToProcess) {
      // Skip if player has no valid image reference
      if (!player || !player.playerid || !player.image) continue;
      
      const exists = await verifyImageExists(player.image);
      
      if (!exists) {
        // Clear invalid image reference
        const success = await clearInvalidImageReference(player.playerid);
        if (success) fixedCount++;
      }
    }
    
    // Return whether we've processed all players
    const completed = playersToProcess.length === playersWithImages.length;
    
    return {
      fixedCount,
      completed
    };
  } catch (error) {
    console.error("Exception refreshing image references:", error);
    return {fixedCount: 0, completed: false};
  }
};
