
import { supabase } from '@/integrations/supabase/client';
import { chunk } from '../../dataConverter';
import { toast } from "sonner";

/**
 * Save team match statistics to the database
 */
export const saveTeamMatchStats = async (
  teamStats: any[], 
  progressCallback?: (current: number, total: number) => void
): Promise<boolean> => {
  try {
    console.log(`Sauvegarde de ${teamStats.length} statistiques d'équipe par match...`);
    
    if (!teamStats || teamStats.length === 0) {
      console.log("Aucune statistique d'équipe par match à sauvegarder");
      return true;
    }
    
    // Extract all unique match IDs from team stats
    const matchIds = [...new Set(teamStats.map(stat => stat.match_id))];
    
    // Get all existing match IDs from the matches table
    const { data: existingMatches, error: matchesError } = await supabase
      .from('matches')
      .select('id')
      .in('id', matchIds);
    
    if (matchesError) {
      console.error("Erreur lors de la vérification des matchs existants:", matchesError);
      toast.error("Erreur lors de la vérification des matchs existants");
      return false;
    }
    
    // Create a Set of existing match IDs for quick lookup
    const existingMatchIds = new Set(existingMatches?.map(match => match.id) || []);
    
    // Filter stats to only include those with valid match references
    const validStats = teamStats.filter(stat => {
      const isValid = stat !== null && 
                      stat !== undefined && 
                      stat.match_id && 
                      existingMatchIds.has(stat.match_id) &&
                      stat.team_id;  // Ensure team_id is present
      
      if (!isValid && stat && stat.match_id) {
        console.log(`Skipping team stat for match ${stat.match_id} - match does not exist in database or missing team_id`);
      }
      
      return isValid;
    }).map(stat => {
      // Convert side to boolean for is_blue_side
      if (!('is_blue_side' in stat)) {
        stat.is_blue_side = stat.side?.toLowerCase() === 'blue';
      }
      
      // Normalize boolean fields
      ['first_blood', 'first_dragon', 'first_herald', 'first_baron', 
       'first_tower', 'first_mid_tower', 'first_three_towers'].forEach(field => {
        if (typeof stat[field] !== 'boolean') {
          stat[field] = !!stat[field];
        }
      });
      
      return stat;
    });
    
    console.log(`Found ${validStats.length} valid team match statistics records (${teamStats.length - validStats.length} skipped)`);
    
    if (validStats.length === 0) {
      toast.warning("Aucune statistique valide d'équipe n'a été trouvée pour les matchs existants");
      return true;
    }
    
    let successCount = 0;
    let errorCount = 0;
    let processedCount = 0;
    const totalStats = validStats.length;
    
    // Split records into manageable chunks for faster processing
    const BATCH_SIZE = 100;
    const statsChunks = chunk(validStats, BATCH_SIZE);
    
    // Process chunks with progress reporting
    for (let i = 0; i < statsChunks.length; i++) {
      try {
        const currentBatch = statsChunks[i];
        
        // Use upsert with onConflict handling
        const { error } = await supabase
          .from('team_match_stats')
          .upsert(currentBatch, {
            onConflict: 'team_id,match_id',
            ignoreDuplicates: false
          });
        
        if (error) {
          console.error("Erreur lors de l'upsert des statistiques d'équipe:", error);
          errorCount += currentBatch.length;
        } else {
          successCount += currentBatch.length;
        }
        
        processedCount += currentBatch.length;
        
        if (progressCallback) {
          progressCallback(processedCount, totalStats);
        }
        
        // Add a small delay between batches
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (batchError) {
        console.error("Erreur inattendue lors du traitement du lot de statistiques d'équipe:", batchError);
        errorCount += statsChunks[i].length;
      }
    }
    
    console.log(`${successCount} statistiques d'équipe par match sauvegardées avec succès.`);
    
    if (errorCount > 0) {
      const skippedCount = teamStats.length - validStats.length;
      
      if (skippedCount > 0) {
        toast.warning(`${skippedCount} statistiques d'équipe ont été ignorées car les matchs associés n'existent pas dans la base de données.`);
      }
      
      toast.warning(`${errorCount} statistiques d'équipe n'ont pas été importées correctement.`);
    } else {
      toast.success(`${successCount} statistiques d'équipe importées avec succès.`);
    }
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des statistiques d'équipe:", error);
    toast.error("Une erreur s'est produite lors de l'enregistrement des statistiques des équipes");
    return false;
  }
};
