
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
    
    // Ensure all required fields are present
    const validStats = playerStats.map(stat => {
      // Make sure we have the required fields for each stat
      if (!stat.participant_id && stat.player_id && stat.match_id) {
        // Generate a participant_id if it doesn't exist
        stat.participant_id = `${stat.player_id}_${stat.match_id}`;
      }
      return stat;
    }).filter(stat => stat.player_id && stat.match_id);
    
    console.log(`Found ${validStats.length} valid player match statistics records`);
    
    // Insert player match stats in batches of 50
    const statsChunks = chunk(validStats, 50);
    let successCount = 0;
    
    for (const statsChunk of statsChunks) {
      try {
        // Instead of using upsert with onConflict which was causing errors,
        // we'll first delete any existing records for these player/match combinations
        // and then insert new ones
        const playerMatchIds = statsChunk.map(stat => ({
          player_id: stat.player_id,
          match_id: stat.match_id
        }));
        
        // Delete existing records for these player/match combinations
        for (const id of playerMatchIds) {
          await supabase
            .from('player_match_stats')
            .delete()
            .match({ player_id: id.player_id, match_id: id.match_id });
        }
        
        // Now insert the new records
        const { error: statsError, data } = await supabase
          .from('player_match_stats')
          .insert(statsChunk);
        
        if (statsError) {
          console.error("Error inserting player match stats:", statsError);
          console.error("Failed stats sample:", JSON.stringify(statsChunk[0]));
          continue; // Continue with the next batch
        }
        
        successCount += statsChunk.length;
        console.log(`Successfully inserted batch of ${statsChunk.length} player match statistics`);
      } catch (error) {
        console.error("Error processing player match stats batch:", error);
        continue; // Continue with next batch
      }
    }
    
    console.log(`Successfully saved ${successCount}/${playerStats.length} player match statistics`);
    return successCount > 0;
  } catch (error) {
    console.error("Error saving player match statistics:", error);
    toast.error("Une erreur s'est produite lors de l'enregistrement des statistiques des joueurs");
    return false;
  }
};
