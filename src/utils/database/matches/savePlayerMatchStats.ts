
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
    
    // Extract all unique match IDs from player stats
    const matchIds = [...new Set(playerStats.map(stat => stat.match_id))];
    console.log(`Found ${matchIds.length} unique matches referenced in player stats`);
    
    // Process match IDs in batches to avoid "URI too large" errors
    const BATCH_SIZE_IDS = 500;
    let existingMatchIds = new Set<string>();
    let missingMatchIds = new Set<string>();
    
    // Split matchIds into chunks for safer batch processing
    const matchIdBatches = chunk(matchIds, BATCH_SIZE_IDS);
    console.log(`Processing ${matchIdBatches.length} batches of match IDs`);
    
    // Process each batch of match IDs
    for (const matchIdBatch of matchIdBatches) {
      try {
        const { data: existingMatches, error: matchesError } = await supabase
          .from('matches')
          .select('id')
          .in('id', matchIdBatch);
        
        if (matchesError) {
          console.error(`Error in batch check for ${matchIdBatch.length} match IDs:`, matchesError);
          continue; // Continue with next batch instead of failing completely
        }
        
        // Add found matches to our set
        (existingMatches || []).forEach(match => existingMatchIds.add(match.id));
        
        // Identify missing matches in this batch
        matchIdBatch.forEach(id => {
          if (!existingMatchIds.has(id)) {
            missingMatchIds.add(id);
          }
        });
      } catch (batchError) {
        console.error(`Unexpected error in match batch check:`, batchError);
      }
    }
    
    console.log(`Found ${existingMatchIds.size} matches in database out of ${matchIds.length} referenced`);
    
    if (missingMatchIds.size > 0) {
      console.log(`Warning: ${missingMatchIds.size} referenced match IDs don't exist in database`);
      console.log("First few missing match IDs:", [...missingMatchIds].slice(0, 5));
    }
    
    // Filter stats to only include those with valid match references
    const validStats = playerStats.filter(stat => {
      const isValid = stat !== null && 
                      stat !== undefined && 
                      stat.match_id && 
                      existingMatchIds.has(stat.match_id);
      
      if (!isValid && stat && stat.match_id) {
        if (missingMatchIds.has(stat.match_id)) {
          // This is an expected issue - match doesn't exist in our database
          // Don't log every one of these as it floods the console
        } else {
          console.log(`Skipping player stat for match ${stat.match_id} - invalid data or match does not exist`);
        }
      }
      
      return isValid;
    }).map(stat => {
      // Make sure we have the required fields for each stat
      if (!stat.participant_id && stat.player_id && stat.match_id) {
        // Generate a participant_id if it doesn't exist
        stat.participant_id = `${stat.player_id}_${stat.match_id}`;
      }
      
      // Important: Ensure is_winner is passed to the database
      if (typeof stat.is_winner !== 'boolean') {
        stat.is_winner = !!stat.is_winner; // Convert truthy/falsy values to boolean
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
      
      // Pour éviter d'avoir des valeurs indéfinies ou nulles
      for (const key in stat) {
        if (typeof stat[key] === 'undefined') {
          if (typeof stat[key] === 'boolean') {
            stat[key] = false;
          } else if (typeof stat[key] === 'number') {
            stat[key] = 0;
          } else if (typeof stat[key] === 'string') {
            stat[key] = '';
          }
        }
      }
      
      return stat;
    });
    
    const skippedCount = playerStats.length - validStats.length;
    console.log(`Found ${validStats.length} valid player match statistics records (${skippedCount} skipped)`);
    
    if (validStats.length === 0) {
      if (skippedCount > 0) {
        toast.warning(`${skippedCount} statistiques de joueurs n'ont pas été importées car les matchs associés n'existent pas dans la base de données.`);
      } else {
        toast.warning("Aucune statistique valide de joueur n'a été trouvée pour les matchs existants");
      }
      return true;
    }
    
    // Process all stats without match validation
    console.log("Processing player stats with validation complete");
    
    // Split records into manageable chunks for faster processing
    const BATCH_SIZE = 50;
    const totalStats = validStats.length;
    
    let successCount = 0;
    let errorCount = 0;
    let processedCount = 0;
    
    // Split records into chunks
    const statsChunks = chunk(validStats, BATCH_SIZE);
    console.log(`Processing ${statsChunks.length} batches with batch size ${BATCH_SIZE}`);
    
    // Process chunks sequentially for reliability
    for (let i = 0; i < statsChunks.length; i++) {
      try {
        const statsChunk = statsChunks[i];
        
        // Log each chunk processing
        console.log(`Processing batch ${i+1}/${statsChunks.length}, ${statsChunk.length} records`);
        
        // Use upsert with onConflict handling
        const { data, error } = await supabase
          .from('player_match_stats')
          .upsert(statsChunk, {
            onConflict: 'player_id,match_id',
            ignoreDuplicates: false
          });
        
        if (error) {
          console.error("Error upserting player match stats batch:", error);
          
          // If the batch fails, try individual inserts
          let individualSuccessCount = 0;
          for (const stat of statsChunk) {
            try {
              const { error: individualError } = await supabase
                .from('player_match_stats')
                .upsert([stat], {
                  onConflict: 'player_id,match_id',
                  ignoreDuplicates: false
                });
              
              if (!individualError) {
                individualSuccessCount++;
                successCount++;
              } else {
                errorCount++;
                console.error(`Individual insert error for ${stat.player_id} in match ${stat.match_id}:`, individualError);
              }
            } catch (individualCatchError) {
              errorCount++;
              console.error(`Exception for ${stat.player_id} in match ${stat.match_id}:`, individualCatchError);
            }
          }
          
          console.log(`Batch ${i+1} fallback: ${individualSuccessCount}/${statsChunk.length} succeeded individually`);
        } else {
          successCount += statsChunk.length;
          console.log(`Batch ${i+1} complete: ${statsChunk.length} records saved successfully`);
        }
        
        processedCount += statsChunk.length;
        
        // Report progress through callback
        if (progressCallback) {
          progressCallback(processedCount, totalStats);
        }
        
        // Add a deliberate delay between batches to avoid overloading the database
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (batchError) {
        console.error("Unexpected error processing player stats batch:", batchError);
        errorCount += statsChunks[i].length;
      }
    }
    
    console.log(`Successfully processed ${successCount}/${totalStats} player match statistics (${errorCount} errors)`);
    
    // Customize the messages based on the results
    if (errorCount > 0) {
      const successRate = successCount / totalStats;
      
      if (skippedCount > 0) {
        toast.warning(`${skippedCount} statistiques de joueurs ont été ignorées car les matchs associés n'existent pas dans la base de données.`);
      }
      
      if (successRate < 0.9) {
        toast.warning(`Seulement ${Math.round(successRate * 100)}% des statistiques de joueurs ont été importées. Certaines données peuvent être manquantes.`);
      } else {
        toast.warning(`${errorCount} statistiques de joueurs n'ont pas été importées correctement, mais la plupart des données ont été sauvegardées.`);
      }
    } else {
      toast.success(`${successCount} statistiques de joueurs importées avec succès.`);
    }
    
    return true;
  } catch (error) {
    console.error("Error saving player match statistics:", error);
    toast.error("Une erreur s'est produite lors de l'enregistrement des statistiques des joueurs");
    return true;
  }
};
