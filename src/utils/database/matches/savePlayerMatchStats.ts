
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
    
    // Insert player match stats in batches of 25 (smaller batch size to prevent timeouts)
    const statsChunks = chunk(validStats, 25);
    let successCount = 0;
    let errorCount = 0;
    
    for (const [index, statsChunk] of statsChunks.entries()) {
      try {
        // Log progress every 10 batches
        if (index % 10 === 0) {
          console.log(`Processing batch ${index + 1}/${statsChunks.length} of player match statistics`);
        }
        
        // Instead of deleting first, we'll use upsert with onConflict strategy
        const { error: statsError, data } = await supabase
          .from('player_match_stats')
          .upsert(statsChunk, { 
            onConflict: 'player_id,match_id',
            ignoreDuplicates: false
          });
        
        if (statsError) {
          console.error("Error upserting player match stats:", statsError);
          
          // If upsert fails due to conflict handling, fall back to delete-then-insert approach
          if (statsError.message.includes("conflict") || statsError.message.includes("duplicate")) {
            console.log("Falling back to delete-then-insert approach for this batch");
            
            // Delete existing records for these player/match combinations
            for (const stat of statsChunk) {
              await supabase
                .from('player_match_stats')
                .delete()
                .match({ player_id: stat.player_id, match_id: stat.match_id });
            }
            
            // Now insert the new records
            const { error: insertError } = await supabase
              .from('player_match_stats')
              .insert(statsChunk);
              
            if (insertError) {
              console.error("Error in fallback insert of player match stats:", insertError);
              errorCount += statsChunk.length;
              continue;
            }
          } else {
            errorCount += statsChunk.length;
            continue; // Continue with the next batch
          }
        }
        
        successCount += statsChunk.length;
        
        // Log success every 10 batches
        if (index % 10 === 0) {
          console.log(`Successfully processed batch ${index + 1}/${statsChunks.length} (${successCount} records so far)`);
        }
      } catch (error) {
        console.error("Error processing player match stats batch:", error);
        errorCount += statsChunk.length;
        continue; // Continue with next batch
      }
    }
    
    console.log(`Successfully saved ${successCount}/${playerStats.length} player match statistics (${errorCount} errors)`);
    return successCount > 0;
  } catch (error) {
    console.error("Error saving player match statistics:", error);
    toast.error("Une erreur s'est produite lors de l'enregistrement des statistiques des joueurs");
    return false;
  }
};
