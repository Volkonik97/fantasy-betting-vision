
import { supabase } from '@/integrations/supabase/client';
import { chunk } from '../../dataConverter';
import { toast } from "sonner";

/**
 * Save player match statistics to the database
 */
export const savePlayerMatchStats = async (playerStats: any[]): Promise<boolean> => {
  try {
    console.log(`Saving ${playerStats.length} player match statistics to Supabase`);
    
    if (!playerStats || playerStats.length === 0) {
      console.log("No player match statistics to save");
      return true;
    }
    
    // Insert player match stats in batches of 50 using upsert
    const statsChunks = chunk(playerStats, 50);
    let successCount = 0;
    
    for (const statsChunk of statsChunks) {
      try {
        const { error: statsError } = await supabase
          .from('player_match_stats')
          .upsert(statsChunk, { onConflict: 'participant_id,match_id,player_id' });
        
        if (statsError) {
          console.error("Error upserting player match stats:", statsError);
          continue; // Continue with the next batch
        }
        
        successCount += statsChunk.length;
      } catch (error) {
        console.error("Error processing player match stats batch:", error);
        continue; // Continue with next batch
      }
    }
    
    console.log(`Successfully upserted ${successCount}/${playerStats.length} player match statistics`);
    return successCount > 0;
  } catch (error) {
    console.error("Error saving player match statistics:", error);
    toast.error("Une erreur s'est produite lors de l'enregistrement des statistiques des joueurs");
    return false;
  }
};
