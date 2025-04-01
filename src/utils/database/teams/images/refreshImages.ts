
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
