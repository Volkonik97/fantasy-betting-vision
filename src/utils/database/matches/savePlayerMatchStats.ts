
import { supabase } from '@/integrations/supabase/client';
import { chunk } from '../../dataConverter';
import { toast } from "sonner";

/**
 * Save player match statistics to the database
 */
export const savePlayerMatchStats = async (
  playerStats: any[], 
  progressCallback?: (current: number, total: number) => void
): Promise<boolean> => {
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
    
    // Use even smaller batch size to prevent timeouts and improve reliability
    const BATCH_SIZE = 5; // Extremely small batch size for better reliability
    const statsChunks = chunk(validStats, BATCH_SIZE);
    let successCount = 0;
    let errorCount = 0;
    let processedCount = 0;
    
    // Process in smaller parallel batches with rate limiting
    const MAX_CONCURRENT = 2; // Only process 2 chunks at a time to avoid overwhelming the database
    const totalStats = validStats.length;
    
    for (let i = 0; i < statsChunks.length; i += MAX_CONCURRENT) {
      // Take a slice of chunks to process in parallel
      const chunksToProcess = statsChunks.slice(i, i + MAX_CONCURRENT);
      console.log(`Processing batches ${i+1}-${i+Math.min(MAX_CONCURRENT, statsChunks.length-i)}/${statsChunks.length}`);
      
      try {
        // Process the batches in parallel, but limit concurrency
        const results = await Promise.all(chunksToProcess.map(async (statsChunk) => {
          try {
            // First try to delete existing records to avoid conflicts
            for (const stat of statsChunk) {
              try {
                await supabase
                  .from('player_match_stats')
                  .delete()
                  .match({ player_id: stat.player_id, match_id: stat.match_id });
              } catch (error) {
                console.error(`Error deleting existing stat for ${stat.player_id} in match ${stat.match_id}:`, error);
                // Continue despite deletion error
              }
            }
            
            // Insert the new records after deletion
            const { error: insertError } = await supabase
              .from('player_match_stats')
              .insert(statsChunk);
              
            if (insertError) {
              console.error("Error inserting player match stats batch:", insertError);
              
              // Try to insert records one by one if batch insert fails
              for (const stat of statsChunk) {
                try {
                  const { error: singleInsertError } = await supabase
                    .from('player_match_stats')
                    .insert([stat]);
                    
                  if (singleInsertError) {
                    console.error(`Error inserting single player match stat for player ${stat.player_id} in match ${stat.match_id}:`, singleInsertError);
                    errorCount++;
                  } else {
                    successCount++;
                  }
                } catch (singleError) {
                  console.error(`Failed to insert stat for player ${stat.player_id} in match ${stat.match_id}:`, singleError);
                  errorCount++;
                }
              }
            } else {
              successCount += statsChunk.length;
            }
            
            return statsChunk.length;
          } catch (batchError) {
            console.error("Error processing player match stats batch:", batchError);
            // Count all stats in this batch as errors
            errorCount += statsChunk.length;
            return 0;
          }
        }));
        
        // Update the processed count
        const processedInBatch = results.reduce((sum, count) => sum + count, 0);
        processedCount += processedInBatch;
        
        // Report progress through callback
        if (progressCallback) {
          progressCallback(processedCount, totalStats);
        }
        
        // Log progress more frequently
        console.log(`Processed ${processedCount}/${totalStats} player match statistics (${Math.round(processedCount/totalStats*100)}%)`);
        
        // Add a small delay between batches to avoid rate limits
        if (i + MAX_CONCURRENT < statsChunks.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (parallelError) {
        console.error("Error in parallel batch processing:", parallelError);
      }
    }
    
    console.log(`Successfully saved ${successCount}/${playerStats.length} player match statistics (${errorCount} errors)`);
    
    // Return success if at least 50% of the records were saved successfully
    const successRate = successCount / playerStats.length;
    if (successRate < 0.5) {
      toast.warning(`Seulement ${Math.round(successRate * 100)}% des statistiques de joueurs ont été importées. Certaines données peuvent être manquantes.`);
    }
    
    return successCount > 0;
  } catch (error) {
    console.error("Error saving player match statistics:", error);
    toast.error("Une erreur s'est produite lors de l'enregistrement des statistiques des joueurs");
    return false;
  }
};
