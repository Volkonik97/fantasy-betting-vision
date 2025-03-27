
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
    
    // Reduce batch size even further to prevent timeouts
    const statsChunks = chunk(validStats, 10); // Smaller batch size for better reliability
    let successCount = 0;
    let errorCount = 0;
    
    for (const [index, statsChunk] of statsChunks.entries()) {
      try {
        // Log progress more frequently to track imports better
        if (index % 5 === 0) {
          console.log(`Processing batch ${index + 1}/${statsChunks.length} of player match statistics`);
        }
        
        // First try to delete existing records to avoid conflicts
        for (const stat of statsChunk) {
          await supabase
            .from('player_match_stats')
            .delete()
            .match({ player_id: stat.player_id, match_id: stat.match_id });
        }
        
        // Insert the new records after deletion
        const { error: insertError } = await supabase
          .from('player_match_stats')
          .insert(statsChunk);
          
        if (insertError) {
          console.error("Error inserting player match stats:", insertError);
          
          // Try to insert records one by one if batch insert fails
          for (const stat of statsChunk) {
            const { error: singleInsertError } = await supabase
              .from('player_match_stats')
              .insert([stat]);
              
            if (singleInsertError) {
              console.error(`Error inserting single player match stat for player ${stat.player_id} in match ${stat.match_id}:`, singleInsertError);
              errorCount++;
            } else {
              successCount++;
            }
          }
        } else {
          successCount += statsChunk.length;
        }
        
        // Log success more frequently
        if (index % 5 === 0 || index === statsChunks.length - 1) {
          console.log(`Successfully processed batch ${index + 1}/${statsChunks.length} (${successCount} records so far)`);
        }
      } catch (error) {
        console.error("Error processing player match stats batch:", error);
        
        // Try to save each record individually on batch error
        for (const stat of statsChunk) {
          try {
            // Delete if exists
            await supabase
              .from('player_match_stats')
              .delete()
              .match({ player_id: stat.player_id, match_id: stat.match_id });
              
            // Insert new
            const { error: singleError } = await supabase
              .from('player_match_stats')
              .insert([stat]);
              
            if (singleError) {
              console.error(`Error on individual insert for player ${stat.player_id} in match ${stat.match_id}:`, singleError);
              errorCount++;
            } else {
              successCount++;
            }
          } catch (individualError) {
            console.error(`Failed to process stat for player ${stat.player_id} in match ${stat.match_id}:`, individualError);
            errorCount++;
          }
        }
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
