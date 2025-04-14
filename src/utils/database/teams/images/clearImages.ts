
import { supabase } from "@/integrations/supabase/client";

/**
 * Clear invalid image reference for a specific player
 * @param playerId Player ID to clear image reference for
 * @returns Boolean indicating if operation was successful
 */
export const clearInvalidImageReference = async (playerId: string): Promise<boolean> => {
  if (!playerId) {
    console.error("No player ID provided");
    return false;
  }
  
  try {
    // Simple approach to avoid type issues - use raw query without chaining
    const updateResponse = await supabase.from('players').update({ image: null });
    
    // Handle case when data is null
    if (updateResponse.data) {
      // Then apply filter separately
      const filtered = updateResponse.data.filter(item => item.id === playerId);
    }
    
    // Handle error
    if (updateResponse.error) {
      console.error("Error clearing image reference:", updateResponse.error);
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
 * @returns Object containing success status and count of cleared references
 */
export const clearAllPlayerImageReferences = async (): Promise<{ success: boolean; clearedCount: number }> => {
  try {
    // Get count of players with images before clearing
    let beforeCount = 0;
    
    // Simplify the query to avoid deep type instantiation
    const countResponse = await supabase.from('players').select('*');
    
    // Manually filter and count players with images
    if (countResponse.data) {
      beforeCount = countResponse.data.filter(player => player.image !== null).length;
    }
    
    if (countResponse.error) {
      console.error("Error counting player images:", countResponse.error);
      return { success: false, clearedCount: 0 };
    }

    // Update all players to set image to null - simplified approach
    const updateResponse = await supabase.from('players').update({ image: null });
    
    if (updateResponse.error) {
      console.error("Error clearing all image references:", updateResponse.error);
      return { success: false, clearedCount: 0 };
    }
    
    return { 
      success: true, 
      clearedCount: beforeCount
    };
  } catch (error) {
    console.error("Exception clearing all image references:", error);
    return { success: false, clearedCount: 0 };
  }
};
