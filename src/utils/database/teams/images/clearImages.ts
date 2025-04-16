
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
 * Clear all player image references
 * @returns Object with success status and count of cleared references
 */
export const clearAllPlayerImageReferences = async (): Promise<{ success: boolean, clearedCount: number }> => {
  try {
    // This was failing because the UPDATE requires a WHERE clause
    // Let's add a condition that covers all players but is still valid
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
