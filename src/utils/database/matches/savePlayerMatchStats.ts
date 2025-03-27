
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
    
    // Improved batch size for better performance
    const BATCH_SIZE = 50; // Increased from 3 to 50 for much better performance
    const statsChunks = chunk(validStats, BATCH_SIZE);
    let successCount = 0;
    let errorCount = 0;
    let processedCount = 0;
    
    // Process in parallel batches with reasonable concurrency
    const MAX_CONCURRENT = 3; // Process 3 chunks at a time instead of just 1
    const totalStats = validStats.length;
    
    // First check which records already exist to implement incremental updates
    console.log("Fetching existing records to implement incremental updates...");
    const existingRecordsMap = new Map();
    
    // Collect all unique match_id and player_id combinations
    const uniqueIdentifiers = validStats.map(stat => ({
      match_id: stat.match_id,
      player_id: stat.player_id
    }));
    
    // Fetch existing records in batches to avoid query size limits
    const idChunks = chunk(uniqueIdentifiers, 100);
    for (const idChunk of idChunks) {
      // Create a filter condition for each chunk
      const filterConditions = idChunk.map(id => 
        `(match_id.eq.${id.match_id}.and.player_id.eq.${id.player_id})`
      ).join(',');
      
      // Query existing records using the OR conditions
      const { data: existingRecords } = await supabase
        .from('player_match_stats')
        .select('id, player_id, match_id, updated_at')
        .or(filterConditions);
      
      // Add the existing records to our map
      if (existingRecords) {
        existingRecords.forEach(record => {
          const key = `${record.player_id}_${record.match_id}`;
          existingRecordsMap.set(key, record);
        });
      }
    }
    
    console.log(`Found ${existingRecordsMap.size} existing records out of ${validStats.length} total records`);
    
    // Separate records into new ones and updates
    const newRecords = [];
    const updateRecords = [];
    
    for (const stat of validStats) {
      const key = `${stat.player_id}_${stat.match_id}`;
      if (existingRecordsMap.has(key)) {
        // Update existing record
        stat.id = existingRecordsMap.get(key).id;
        updateRecords.push(stat);
      } else {
        // New record
        newRecords.push(stat);
      }
    }
    
    console.log(`Identified ${newRecords.length} new records and ${updateRecords.length} records to update`);
    
    // Process new records first
    if (newRecords.length > 0) {
      const newRecordChunks = chunk(newRecords, BATCH_SIZE);
      console.log(`Processing ${newRecordChunks.length} batches of new records...`);
      
      for (let i = 0; i < newRecordChunks.length; i += MAX_CONCURRENT) {
        const chunksToProcess = newRecordChunks.slice(i, i + MAX_CONCURRENT);
        
        try {
          // Process the batches in parallel
          const results = await Promise.all(chunksToProcess.map(async (statsChunk) => {
            try {
              const { error, count } = await supabase
                .from('player_match_stats')
                .insert(statsChunk)
                .select('count');
                
              if (error) {
                console.error("Error inserting player match stats batch:", error);
                
                // Try individual inserts if batch fails
                let individualSuccessCount = 0;
                for (const stat of statsChunk) {
                  try {
                    const { error: singleInsertError } = await supabase
                      .from('player_match_stats')
                      .insert([stat]);
                      
                    if (!singleInsertError) {
                      individualSuccessCount++;
                    } else {
                      errorCount++;
                    }
                  } catch (singleError) {
                    console.error(`Failed to insert stat for player ${stat.player_id} in match ${stat.match_id}:`, singleError);
                    errorCount++;
                  }
                }
                
                return individualSuccessCount;
              }
              
              return statsChunk.length;
            } catch (batchError) {
              console.error("Error processing player match stats batch:", batchError);
              errorCount += statsChunk.length;
              return 0;
            }
          }));
          
          // Update the processed count
          const processedInBatch = results.reduce((sum, count) => sum + count, 0);
          processedCount += processedInBatch;
          successCount += processedInBatch;
          
          // Report progress through callback
          if (progressCallback) {
            progressCallback(processedCount, totalStats);
          }
          
          // Log progress
          console.log(`Inserted new records: ${processedCount}/${newRecords.length} (${Math.round(processedCount/newRecords.length*100)}%)`);
        } catch (parallelError) {
          console.error("Error in batch processing:", parallelError);
        }
      }
    }
    
    // Now process updates
    if (updateRecords.length > 0) {
      const updateRecordChunks = chunk(updateRecords, BATCH_SIZE);
      console.log(`Processing ${updateRecordChunks.length} batches of updates...`);
      
      let updatedCount = 0;
      
      for (let i = 0; i < updateRecordChunks.length; i += MAX_CONCURRENT) {
        const chunksToProcess = updateRecordChunks.slice(i, i + MAX_CONCURRENT);
        
        try {
          // Process the batches in parallel
          const results = await Promise.all(chunksToProcess.map(async (statsChunk) => {
            try {
              let chunkSuccessCount = 0;
              
              // Update records individually since upsert might not work well for complex updates
              for (const stat of statsChunk) {
                try {
                  const { error } = await supabase
                    .from('player_match_stats')
                    .update(stat)
                    .eq('id', stat.id);
                    
                  if (!error) {
                    chunkSuccessCount++;
                  } else {
                    console.error(`Error updating player match stat for player ${stat.player_id} in match ${stat.match_id}:`, error);
                    errorCount++;
                  }
                } catch (updateError) {
                  console.error(`Failed to update stat for player ${stat.player_id} in match ${stat.match_id}:`, updateError);
                  errorCount++;
                }
              }
              
              return chunkSuccessCount;
            } catch (batchError) {
              console.error("Error processing player match stats update batch:", batchError);
              errorCount += statsChunk.length;
              return 0;
            }
          }));
          
          // Update the processed count
          const updatedInBatch = results.reduce((sum, count) => sum + count, 0);
          updatedCount += updatedInBatch;
          processedCount += updatedInBatch;
          successCount += updatedInBatch;
          
          // Report progress through callback
          if (progressCallback) {
            progressCallback(newRecords.length + updatedCount, totalStats);
          }
          
          // Log progress
          console.log(`Updated records: ${updatedCount}/${updateRecords.length} (${Math.round(updatedCount/updateRecords.length*100)}%)`);
        } catch (parallelError) {
          console.error("Error in update batch processing:", parallelError);
        }
      }
    }
    
    console.log(`Successfully processed ${successCount}/${playerStats.length} player match statistics (${errorCount} errors)`);
    
    // Return true even if some stats failed to save, so we don't block the overall import process
    if (errorCount > 0) {
      const successRate = successCount / playerStats.length;
      if (successRate < 0.9) {
        toast.warning(`Seulement ${Math.round(successRate * 100)}% des statistiques de joueurs ont été importées. Certaines données peuvent être manquantes.`);
      } else {
        toast.warning(`${errorCount} statistiques de joueurs n'ont pas été importées correctement, mais la plupart des données ont été sauvegardées.`);
      }
    } else {
      toast.success(`${successCount} statistiques de joueurs importées avec succès.`);
    }
    
    return true; // Always return true to continue with the rest of the import process
  } catch (error) {
    console.error("Error saving player match statistics:", error);
    toast.error("Une erreur s'est produite lors de l'enregistrement des statistiques des joueurs");
    // We'll still return true to avoid blocking the rest of the import
    return true;
  }
};
