
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { chunk } from '@/utils/dataConverter';

/**
 * Sauvegarde les statistiques d'équipe par match dans la base de données
 * @param teamMatchStats Liste des statistiques d'équipe par match à sauvegarder
 * @param progressCallback Callback pour suivre la progression
 */
export async function saveTeamMatchStats(
  teamMatchStats: any[],
  progressCallback?: (current: number, total: number) => void
): Promise<boolean> {
  try {
    const total = teamMatchStats.length;
    console.log(`Sauvegarde de ${total} statistiques d'équipe par match...`);
    
    if (total === 0) {
      console.log('Aucune statistique d\'équipe par match à sauvegarder.');
      return true;
    }
    
    // Extract all unique match IDs from team stats
    const matchIds = [...new Set(teamMatchStats.map(stat => stat.match_id))];
    console.log(`${matchIds.length} matchs uniques référencés dans les statistiques d'équipes`);
    
    // Process match IDs in batches to avoid "URI too large" errors
    const BATCH_SIZE_IDS = 500;
    let existingMatchIds = new Set<string>();
    let missingMatchIds = new Set<string>();
    
    // Split matchIds into chunks for safer batch processing
    const matchIdBatches = chunk(matchIds, BATCH_SIZE_IDS);
    console.log(`Vérification des matchs en ${matchIdBatches.length} lots`);
    
    // Process each batch of match IDs
    for (const matchIdBatch of matchIdBatches) {
      try {
        const { data: existingMatches, error: matchesError } = await supabase
          .from('matches')
          .select('id')
          .in('id', matchIdBatch);
        
        if (matchesError) {
          console.error(`Erreur lors de la vérification d'un lot de ${matchIdBatch.length} matchs:`, matchesError);
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
        console.error(`Erreur inattendue lors de la vérification des matchs:`, batchError);
      }
    }
    
    console.log(`Trouvé ${existingMatchIds.size} matchs dans la base de données sur ${matchIds.length} référencés`);
    
    // Filter out team stats for matches that don't exist in the database
    const validTeamStats = teamMatchStats.filter(stat => {
      const isValid = stat && stat.match_id && existingMatchIds.has(stat.match_id);
      if (!isValid && stat && stat.match_id) {
        if (missingMatchIds.has(stat.match_id)) {
          console.log(`Statistique d'équipe ignorée pour le match ${stat.match_id} - match inexistant dans la BDD`);
        } else {
          console.log(`Statistiques d'équipe ignorées pour le match ${stat.match_id} - match inexistant ou problème de données`);
        }
      }
      return isValid;
    });
    
    const skippedCount = teamMatchStats.length - validTeamStats.length;
    console.log(`${validTeamStats.length} statistiques d'équipe valides (${skippedCount} ignorées)`);
    
    if (validTeamStats.length === 0) {
      if (skippedCount > 0) {
        toast.warning(`${skippedCount} statistiques d'équipe n'ont pas été importées car les matchs associés n'existent pas.`);
      } else {
        toast.warning("Aucune statistique valide d'équipe n'a été trouvée.");
      }
      return true;
    }
    
    // Debug a specific match if needed (LOLTMNT02_222859)
    const specificMatch = validTeamStats.filter(stat => stat.match_id === 'LOLTMNT02_222859');
    if (specificMatch.length > 0) {
      console.log(`Statistiques pour le match LOLTMNT02_222859:`, specificMatch);
    }
    
    // Préparation des données pour l'insertion
    const statsToInsert = validTeamStats.map(stat => {
      // Log des dragons clouds pour ce match spécifique
      if (stat.match_id === 'LOLTMNT02_222859') {
        console.log(`Préparation insertion pour match ${stat.match_id}, équipe ${stat.team_id}:`, {
          clouds: stat.clouds,
          side: stat.side,
          dragons: stat.dragons
        });
      }
      
      return {
        match_id: stat.match_id,
        team_id: stat.team_id,
        is_blue_side: stat.side === 'blue',
        kills: stat.team_kills || 0,
        deaths: stat.team_deaths || 0,
        kpm: stat.team_kpm || 0,
        dragons: stat.dragons || 0,
        elemental_drakes: stat.elemental_drakes || 0,
        infernals: stat.infernals || 0,
        mountains: stat.mountains || 0,
        clouds: stat.clouds || 0,
        oceans: stat.oceans || 0,
        chemtechs: stat.chemtechs || 0,
        hextechs: stat.hextechs || 0,
        drakes_unknown: stat.drakes_unknown || 0,
        elders: stat.elders || 0,
        heralds: stat.heralds || 0,
        barons: stat.barons || 0,
        void_grubs: stat.void_grubs || 0,
        towers: stat.towers || 0,
        turret_plates: stat.turret_plates || 0,
        inhibitors: stat.inhibitors || 0,
        first_blood: stat.first_blood === true,
        first_dragon: stat.first_dragon === true,
        first_herald: stat.first_herald === true,
        first_baron: stat.first_baron === true,
        first_tower: stat.first_tower === true,
        first_mid_tower: stat.first_mid_tower === true,
        first_three_towers: stat.first_three_towers === true,
        picks: stat.picks ? JSON.stringify(stat.picks) : null,
        bans: stat.bans ? JSON.stringify(stat.bans) : null
      };
    });
    
    // Diviser les données en lots pour éviter les limitations de taille de requête
    const chunkSize = 100;
    const chunks = chunk(statsToInsert, chunkSize);
    let currentCount = 0;
    
    // Insérer chaque lot
    for (const [index, batch] of chunks.entries()) {
      try {
        const { error } = await supabase
          .from('team_match_stats')
          .upsert(batch, {
            onConflict: 'match_id,team_id',
            ignoreDuplicates: false
          });
        
        if (error) {
          console.error(`Erreur lors de l'insertion du lot ${index + 1}/${chunks.length}:`, error);
          toast.error(`Erreur lors de la sauvegarde des statistiques d'équipe: ${error.message}`);
          
          // Try individual inserts if batch fails
          let individualSuccessCount = 0;
          for (const stat of batch) {
            try {
              const { error: individualError } = await supabase
                .from('team_match_stats')
                .upsert([stat], {
                  onConflict: 'match_id,team_id',
                  ignoreDuplicates: false
                });
                
              if (!individualError) {
                individualSuccessCount++;
              } else {
                console.error(`Erreur individuelle pour l'équipe ${stat.team_id} match ${stat.match_id}:`, individualError);
              }
            } catch (err) {
              console.error(`Erreur individuelle pour l'équipe ${stat.team_id} match ${stat.match_id}:`, err);
            }
          }
          
          console.log(`Lot ${index + 1} fallback: ${individualSuccessCount}/${batch.length} réussis individuellement`);
        } else {
          console.log(`Lot ${index + 1}/${chunks.length} inséré avec succès (${batch.length} stats)`);
        }
        
        currentCount += batch.length;
        if (progressCallback) {
          progressCallback(currentCount, validTeamStats.length);
        }
        
        // Petite pause pour éviter de surcharger la base de données
        if (chunks.length > 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Erreur lors de l'insertion du lot ${index + 1}:`, error);
      }
    }
    
    if (skippedCount > 0) {
      toast.warning(`${skippedCount} statistiques d'équipe ont été ignorées car les matchs associés n'existent pas.`);
    }
    
    console.log(`${statsToInsert.length} statistiques d'équipe par match sauvegardées avec succès.`);
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des statistiques d\'équipe:', error);
    toast.error(`Erreur lors de la sauvegarde des statistiques d'équipe: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return false;
  }
}
