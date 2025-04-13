
import { supabase } from "@/integrations/supabase/client";

/**
 * Clear invalid image reference for a specific player
 * @param playerId Player ID to clear image reference for
 * @returns Boolean indicating if operation was successful
 */
export const clearInvalidImageReference = async (playerId: string): Promise<boolean> => {
  try {
    if (!playerId) {
      console.error("No player ID provided");
      return false;
    }
    
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
 * @returns Object containing success status and count of cleared references
 */
export const clearAllPlayerImageReferences = async (): Promise<{ success: boolean; clearedCount: number }> => {
  try {
    // Get count of players with images before clearing
    const { count, error: countError } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true })
      .not('image', 'is', null);
    
    if (countError) {
      console.error("Error counting player images:", countError);
      return { success: false, clearedCount: 0 };
    }

    const beforeCount = count || 0;

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
      clearedCount: beforeCount
    };
  } catch (error) {
    console.error("Exception clearing all image references:", error);
    return { success: false, clearedCount: 0 };
  }
};
