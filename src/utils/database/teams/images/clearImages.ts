
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
    // Update player record to set image to null
    const result = await supabase
      .from('players')
      .update({ image: null })
      .eq('id', playerId);
    
    // Handle error case explicitly
    if (result.error) {
      console.error("Error clearing image reference:", result.error);
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
    
    const countResult = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true })
      .not('image', 'is', null);
    
    // Handle count response error
    if (countResult.error) {
      console.error("Error counting player images:", countResult.error);
      return { success: false, clearedCount: 0 };
    }
    
    // Extract count
    if (countResult.count !== null) {
      beforeCount = countResult.count;
    }

    // Update all players to set image to null
    const updateResult = await supabase
      .from('players')
      .update({ image: null })
      .not('image', 'is', null);
    
    // Handle update response error
    if (updateResult.error) {
      console.error("Error clearing all image references:", updateResult.error);
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
