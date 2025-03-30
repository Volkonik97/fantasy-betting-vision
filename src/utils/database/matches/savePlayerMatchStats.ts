
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
      
      // Important: Ensure is_winner is passed to the database
      if (typeof stat.is_winner !== 'boolean') {
        console.log("Setting default is_winner to false for", stat.player_id, stat.match_id);
        stat.is_winner = false;
      }
      
      // Handle first blood stats
      if (typeof stat.first_blood_kill !== 'boolean') {
        stat.first_blood_kill = !!stat.first_blood_kill;
      }
      
      if (typeof stat.first_blood_assist !== 'boolean') {
        stat.first_blood_assist = !!stat.first_blood_assist;
      }
      
      if (typeof stat.first_blood_victim !== 'boolean') {
        stat.first_blood_victim = !!stat.first_blood_victim;
      }
      
      return stat;
    }).filter(stat => stat.player_id && stat.match_id);
    
    console.log(`Found ${validStats.length} valid player match statistics records`);
    
    // Check if we have any stats where match_id doesn't exist in the matches table
    // Instead of failing completely, we'll filter these out
    const uniqueMatchIds = [...new Set(validStats.map(stat => stat.match_id))];
    console.log(`Found ${uniqueMatchIds.length} unique match IDs in player stats`);
    
    // Check which match IDs exist in the database
    const { data: existingMatches, error: matchCheckError } = await supabase
      .from('matches')
      .select('id')
      .in('id', uniqueMatchIds);
    
    if (matchCheckError) {
      console.error("Error checking existing matches:", matchCheckError);
      // Continue anyway, but warn the user
      toast.warning("Certains matchs référencés dans les statistiques de joueurs pourraient ne pas exister");
    }
    
    // Create a set of existing match IDs for quick lookup
    const existingMatchIds = new Set((existingMatches || []).map(m => m.id));
    console.log(`Found ${existingMatchIds.size} existing matches out of ${uniqueMatchIds.length}`);
    
    // Filter out player stats for non-existent matches to avoid foreign key errors
    const filteredStats = validStats.filter(stat => existingMatchIds.has(stat.match_id));
    console.log(`Filtered down to ${filteredStats.length} player stats after match ID validation`);
    
    if (filteredStats.length === 0) {
      toast.warning("Aucune statistique de joueur valide n'a pu être importée");
      return true; // Still return success to continue with the rest of the import
    }
    
    // Process the filtered stats
    const BATCH_SIZE = 100;
    const MAX_CONCURRENT = 5;
    const totalStats = filteredStats.length;
    
    let successCount = 0;
    let errorCount = 0;
    let processedCount = 0;
    
    // Split records into chunks for faster processing
    const statsChunks = chunk(filteredStats, BATCH_SIZE);
    console.log(`Processing ${statsChunks.length} batches with batch size ${BATCH_SIZE}`);
    
    // Process chunks in parallel with improved concurrency
    for (let i = 0; i < statsChunks.length; i += MAX_CONCURRENT) {
      const chunksToProcess = statsChunks.slice(i, i + MAX_CONCURRENT);
      
      try {
        // Process the batches in parallel
        const results = await Promise.all(chunksToProcess.map(async (statsChunk) => {
          try {
            // Use upsert instead of separate insert/update operations
            const { error } = await supabase
              .from('player_match_stats')
              .upsert(statsChunk, {
                onConflict: 'player_id,match_id',
                ignoreDuplicates: false
              });
              
            if (error) {
              console.error("Error upserting player match stats batch:", error);
              
              // If batch fails, try individual upserts
              let individualSuccessCount = 0;
              for (const stat of statsChunk) {
                try {
                  const { error: singleError } = await supabase
                    .from('player_match_stats')
                    .upsert([stat], {
                      onConflict: 'player_id,match_id',
                      ignoreDuplicates: false
                    });
                    
                  if (!singleError) {
                    individualSuccessCount++;
                  } else {
                    errorCount++;
                  }
                } catch (singleError) {
                  console.error(`Failed to upsert stat for player ${stat.player_id} in match ${stat.match_id}:`, singleError);
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
        console.log(`Processed records: ${processedCount}/${totalStats} (${Math.round(processedCount/totalStats*100)}%) - Batch ${i/MAX_CONCURRENT + 1}/${Math.ceil(statsChunks.length/MAX_CONCURRENT)}`);
      } catch (parallelError) {
        console.error("Error in batch processing:", parallelError);
      }
      
      // Add a small delay between batch groups to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
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
