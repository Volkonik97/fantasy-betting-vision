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
    
    // Ajouter un debug pour les matchs spécifiques
    const specificMatchIds = ['LOLTMNT02_215152', 'LOLTMNT02_222859'];
    const debugMatches = validTeamStats.filter(stat => specificMatchIds.includes(stat.match_id));
    if (debugMatches.length > 0) {
      debugMatches.forEach(stat => {
        console.log(`[Debug avant insertion] Match ${stat.match_id}, Équipe ${stat.team_id}:`, {
          is_blue_side: stat.is_blue_side,
          dragons: stat.dragons,
          specific: {
            infernals: stat.infernals,
            mountains: stat.mountains, 
            clouds: stat.clouds,
            oceans: stat.oceans,
            chemtechs: stat.chemtechs,
            hextechs: stat.hextechs,
            unknown: stat.drakes_unknown
          }
        });
      });
    }
    
    // Ensure we're working with the correct numeric type for drakes
    const convertToInteger = (value: any): number => {
      if (typeof value === 'number') {
        return Math.floor(value); // Convert float to integer if needed
      }
      if (value === null || value === undefined || value === '') {
        return 0;
      }
      const num = parseInt(String(value).trim()); // Convert to string first in case value is an object
      return isNaN(num) ? 0 : num;
    };
    
    // Fix stats with incorrect dragon values
    validTeamStats.forEach(stat => {
      // Force all drake stats to be integers
      stat.dragons = convertToInteger(stat.dragons);
      stat.infernals = convertToInteger(stat.infernals);
      stat.mountains = convertToInteger(stat.mountains);
      stat.clouds = convertToInteger(stat.clouds);
      stat.oceans = convertToInteger(stat.oceans);
      stat.chemtechs = convertToInteger(stat.chemtechs);
      stat.hextechs = convertToInteger(stat.hextechs);
      stat.drakes_unknown = convertToInteger(stat.drakes_unknown);
      stat.elemental_drakes = convertToInteger(stat.elemental_drakes);
      
      // Debug special matches after conversion
      if (specificMatchIds.includes(stat.match_id)) {
        console.log(`[Debug après conversion] Match ${stat.match_id}, Équipe ${stat.team_id}:`, {
          is_blue_side: stat.is_blue_side,
          dragons: stat.dragons,
          specific: {
            infernals: stat.infernals,
            mountains: stat.mountains,
            clouds: stat.clouds,
            oceans: stat.oceans,
            chemtechs: stat.chemtechs,
            hextechs: stat.hextechs,
            unknown: stat.drakes_unknown
          }
        });
      }
    });
    
    // Préparation des données pour l'insertion avec une vérification plus approfondie
    const statsToInsert = validTeamStats.map(stat => {
      // Ensure numeric fields are properly converted
      const ensureNumber = (value: any): number => {
        if (value === null || value === undefined) return 0;
        if (typeof value === 'number') return value; // Déjà un nombre, retourner tel quel
        const num = Number(value);
        return isNaN(num) ? 0 : num;
      };
      
      // Ensure boolean fields are properly converted
      const ensureBoolean = (value: any): boolean => {
        if (typeof value === 'boolean') return value;
        if (value === 1 || value === '1' || value === 'true' || value === true) return true;
        return false;
      };
      
      // Debug pour les matchs spécifiques
      if (specificMatchIds.includes(stat.match_id)) {
        console.log(`Préparation insertion pour match ${stat.match_id}, équipe ${stat.team_id}:`, {
          is_blue_side: stat.is_blue_side,
          totalDragons: stat.dragons,
          specificDragons: {
            infernals: stat.infernals,
            mountains: stat.mountains,
            clouds: stat.clouds, 
            oceans: stat.oceans,
            chemtechs: stat.chemtechs,
            hextechs: stat.hextechs,
            unknown: stat.drakes_unknown
          }
        });
      }
      
      // S'assurer que les valeurs des types de dragons sont non-nulles
      // Traiter spécialement les types de dragons pour éviter les valeurs nulles ou undefined
      const dragons = convertToInteger(stat.dragons);
      const infernals = convertToInteger(stat.infernals);
      const mountains = convertToInteger(stat.mountains);
      const clouds = convertToInteger(stat.clouds);
      const oceans = convertToInteger(stat.oceans);
      const chemtechs = convertToInteger(stat.chemtechs);
      const hextechs = convertToInteger(stat.hextechs);
      const drakes_unknown = convertToInteger(stat.drakes_unknown);
      
      if (specificMatchIds.includes(stat.match_id)) {
        console.log(`Valeurs après conversion pour match ${stat.match_id}, équipe ${stat.team_id}:`, {
          dragons,
          infernals,
          mountains,
          clouds,
          oceans,
          chemtechs,
          hextechs,
          drakes_unknown
        });
      }
      
      return {
        match_id: stat.match_id,
        team_id: stat.team_id,
        is_blue_side: ensureBoolean(stat.is_blue_side),
        kills: convertToInteger(stat.kills),
        deaths: convertToInteger(stat.deaths),
        kpm: ensureNumber(stat.kpm),
        dragons: dragons,
        elemental_drakes: convertToInteger(stat.elemental_drakes),
        infernals: infernals,
        mountains: mountains,
        clouds: clouds,
        oceans: oceans,
        chemtechs: chemtechs,
        hextechs: hextechs,
        drakes_unknown: drakes_unknown,
        elders: convertToInteger(stat.elders),
        heralds: convertToInteger(stat.heralds),
        barons: convertToInteger(stat.barons),
        void_grubs: convertToInteger(stat.void_grubs),
        towers: convertToInteger(stat.towers),
        turret_plates: convertToInteger(stat.turret_plates),
        inhibitors: convertToInteger(stat.inhibitors),
        first_blood: ensureBoolean(stat.first_blood),
        first_dragon: ensureBoolean(stat.first_dragon),
        first_herald: ensureBoolean(stat.first_herald),
        first_baron: ensureBoolean(stat.first_baron),
        first_tower: ensureBoolean(stat.first_tower),
        first_mid_tower: ensureBoolean(stat.first_mid_tower),
        first_three_towers: ensureBoolean(stat.first_three_towers),
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
