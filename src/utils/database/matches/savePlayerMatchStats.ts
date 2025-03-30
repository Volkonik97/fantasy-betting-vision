
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
    const validStats = playerStats.filter(Boolean).map(stat => {
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
    }).filter(stat => stat.player_id && stat.match_id);
    
    console.log(`Found ${validStats.length} valid player match statistics records`);
    
    // Skip match validation to process all player stats regardless of match existence
    console.log("Processing all player stats without match validation");
    
    // Split records into manageable chunks for faster processing
    const BATCH_SIZE = 50; // Reduce batch size for better reliability
    const MAX_CONCURRENT = 3; // Also reduce concurrency to avoid overwhelming DB
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
            onConflict: 'participant_id',
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
                  onConflict: 'participant_id',
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
    
    // Return true even if some stats failed to save
    if (errorCount > 0) {
      const successRate = successCount / totalStats;
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
