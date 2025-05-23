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
          .select('gameid')
          .in('gameid', matchIdBatch);
        
        if (matchesError) {
          console.error(`Erreur lors de la vérification d'un lot de ${matchIdBatch.length} matchs:`, matchesError);
          continue; // Continue with next batch instead of failing completely
        }
        
        // Add found matches to our set - use gameid as the identifier
        (existingMatches || []).forEach(match => existingMatchIds.add(match.gameid));
        
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
    
    // Ensure we're working with the correct numeric type for stats
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
    
    // Helper function pour convertir les booléens
    const convertToBoolean = (value: any): boolean => {
      if (value === null || value === undefined) return false;
      
      if (typeof value === 'boolean') return value;
      
      if (typeof value === 'string') {
        const lowerValue = value.toLowerCase().trim();
        return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes' || lowerValue === 'oui';
      }
      
      if (typeof value === 'number') {
        return value === 1;
      }
      
      return false;
    };
    
    // Fix stats with incorrect values
    validTeamStats.forEach(stat => {
      // Force numeric stats to be integers
      stat.kills = convertToInteger(stat.team_kills || stat.kills);
      stat.deaths = convertToInteger(stat.team_deaths || stat.deaths);
      stat.towers = convertToInteger(stat.towers);
      stat.inhibitors = convertToInteger(stat.inhibitors);
      stat.heralds = convertToInteger(stat.heralds);
      stat.barons = convertToInteger(stat.barons);
      stat.turret_plates = convertToInteger(stat.turret_plates);
      stat.void_grubs = convertToInteger(stat.void_grubs);
      
      // Ensure dragon stats are integers
      stat.dragons = convertToInteger(stat.dragons);
      stat.elemental_drakes = convertToInteger(stat.elemental_drakes);
      stat.infernals = convertToInteger(stat.infernals);
      stat.mountains = convertToInteger(stat.mountains);
      stat.clouds = convertToInteger(stat.clouds);
      stat.oceans = convertToInteger(stat.oceans);
      stat.chemtechs = convertToInteger(stat.chemtechs);
      stat.hextechs = convertToInteger(stat.hextechs);
      stat.drakes_unknown = convertToInteger(stat.drakes_unknown);
      stat.elders = convertToInteger(stat.elders);
      
      // Convertir les "first" en booléens
      stat.first_blood = convertToBoolean(stat.first_blood);
      stat.first_dragon = convertToBoolean(stat.first_dragon);
      stat.first_herald = convertToBoolean(stat.first_herald);
      stat.first_baron = convertToBoolean(stat.first_baron);
      stat.first_tower = convertToBoolean(stat.first_tower);
      stat.first_mid_tower = convertToBoolean(stat.first_mid_tower);
      stat.first_three_towers = convertToBoolean(stat.first_three_towers);
      
      // Log pour les objectifs
      if ((stat.heralds > 0 || stat.barons > 0 || stat.towers > 0 || 
           stat.turret_plates > 0 || stat.inhibitors > 0 || stat.void_grubs > 0)) {
        console.log(`[saveTeamStats] Match ${stat.match_id}, Team ${stat.team_id}: ` +
                    `Heralds=${stat.heralds}, Barons=${stat.barons}, ` +
                    `Towers=${stat.towers}, TurretPlates=${stat.turret_plates}, ` +
                    `Inhibitors=${stat.inhibitors}, VoidGrubs=${stat.void_grubs}`);
      }
      
      // Log pour les first objectives
      if (stat.first_blood || stat.first_dragon || stat.first_herald || 
          stat.first_baron || stat.first_tower || stat.first_mid_tower || 
          stat.first_three_towers) {
        console.log(`[saveTeamStats] Match ${stat.match_id}, Team ${stat.team_id} - First objectives: ` +
                    `Blood=${stat.first_blood}, Dragon=${stat.first_dragon}, ` +
                    `Herald=${stat.first_herald}, Baron=${stat.first_baron}, ` +
                    `Tower=${stat.first_tower}, MidTower=${stat.first_mid_tower}, ` +
                    `ThreeTowers=${stat.first_three_towers}`);
      }
      
      // Log pour les dragons spécifiques aussi
      if ((stat.dragons > 0 || stat.elemental_drakes > 0 || stat.infernals > 0 || 
           stat.mountains > 0 || stat.clouds > 0 || stat.oceans > 0 || 
           stat.chemtechs > 0 || stat.hextechs > 0 || stat.drakes_unknown > 0 || 
           stat.elders > 0)) {
        console.log(`[saveTeamStats] Match ${stat.match_id}, Team ${stat.team_id}: ` +
                    `Dragons=${stat.dragons}, Elemental=${stat.elemental_drakes}, ` +
                    `Infernal=${stat.infernals}, Mountain=${stat.mountains}, ` +
                    `Cloud=${stat.clouds}, Ocean=${stat.oceans}, ` +
                    `Chemtech=${stat.chemtechs}, Hextech=${stat.hextechs}, ` +
                    `Unknown=${stat.drakes_unknown}, Elder=${stat.elders}`);
      }
      
      // Log pour picks et bans
      if (stat.picks || stat.bans) {
        console.log(`[saveTeamStats] Match ${stat.match_id}, Team ${stat.team_id} - Picks/Bans disponibles:`, {
          hasPicks: !!stat.picks,
          hasBans: !!stat.bans,
          picksType: stat.picks ? typeof stat.picks : 'none',
          bansType: stat.bans ? typeof stat.bans : 'none'
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
      
      // Prepare picks for JSON serialization
      const preparePicks = (picks: any): any => {
        if (!picks) return null;
        if (typeof picks === 'string') {
          try {
            return JSON.parse(picks);
          } catch (e) {
            return picks; // Si ce n'est pas un JSON valide, retourner tel quel
          }
        }
        return picks; // Already an object or array
      };
      
      // Ensure we JSON stringify objects if needed
      const ensureJson = (value: any): string | null => {
        if (value === null || value === undefined) return null;
        if (typeof value === 'string') return value; // Déjà une chaîne, retourner tel quel
        return JSON.stringify(value); // Convertir en JSON
      };
      
      return {
        match_id: stat.match_id,
        team_id: stat.team_id,
        is_blue_side: stat.side?.toLowerCase() === 'blue',
        kills: convertToInteger(stat.team_kills || stat.kills),
        deaths: convertToInteger(stat.team_deaths || stat.deaths),
        kpm: ensureNumber(stat.team_kpm || stat.kpm),
        
        // Dragon statistics - utiliser des valeurs sécurisées
        dragons: convertToInteger(stat.dragons),
        elemental_drakes: convertToInteger(stat.elemental_drakes),
        infernals: convertToInteger(stat.infernals),
        mountains: convertToInteger(stat.mountains),
        clouds: convertToInteger(stat.clouds),
        oceans: convertToInteger(stat.oceans),
        chemtechs: convertToInteger(stat.chemtechs),
        hextechs: convertToInteger(stat.hextechs),
        drakes_unknown: convertToInteger(stat.drakes_unknown),
        elders: convertToInteger(stat.elders),
        
        // Other objectives - utiliser des valeurs sécurisées
        towers: convertToInteger(stat.towers),
        turret_plates: convertToInteger(stat.turret_plates),
        inhibitors: convertToInteger(stat.inhibitors),
        heralds: convertToInteger(stat.heralds),
        barons: convertToInteger(stat.barons),
        void_grubs: convertToInteger(stat.void_grubs),
        
        // First objectives
        first_blood: convertToBoolean(stat.first_blood),
        first_dragon: convertToBoolean(stat.first_dragon),
        first_herald: convertToBoolean(stat.first_herald),
        first_baron: convertToBoolean(stat.first_baron),
        first_tower: convertToBoolean(stat.first_tower),
        first_mid_tower: convertToBoolean(stat.first_mid_tower),
        first_three_towers: convertToBoolean(stat.first_three_towers),
        
        // Picks and bans if available - ensure proper serialization
        picks: stat.picks ? preparePicks(stat.picks) : null,
        bans: stat.bans ? preparePicks(stat.bans) : null
      };
    });
    
    // Create a map to deduplicate stats by match_id and team_id combination
    const uniqueStatsMap = new Map<string, any>();
    
    // Use the map to ensure only one row per match_id + team_id
    statsToInsert.forEach(stat => {
      const key = `${stat.match_id}-${stat.team_id}`;
      uniqueStatsMap.set(key, stat);
    });
    
    // Convert back to array with unique combinations
    const uniqueStats = Array.from(uniqueStatsMap.values());
    console.log(`Après déduplication: ${uniqueStats.length} statistiques d'équipe uniques (éliminé ${statsToInsert.length - uniqueStats.length} doublons)`);
    
    // Log détaillé pour les 5 premières statistiques à insérer
    const sampleStats = uniqueStats.slice(0, 5);
    console.log(`Échantillon de données à insérer:`, sampleStats);
    
    // Recalculate chunks with deduplicated data
    const chunkSize = 100;
    const uniqueChunks = chunk(uniqueStats, chunkSize);
    let currentCount = 0;
    
    // Insérer chaque lot avec les données dédupliquées
    for (const [index, batch] of uniqueChunks.entries()) {
      try {
        const { error } = await supabase
          .from('team_match_stats')
          .upsert(batch, {
            onConflict: 'match_id,team_id',
            ignoreDuplicates: false
          });
        
        if (error) {
          console.error(`Erreur lors de l'insertion du lot ${index + 1}/${uniqueChunks.length}:`, error);
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
          console.log(`Lot ${index + 1}/${uniqueChunks.length} inséré avec succès (${batch.length} stats)`);
        }
        
        currentCount += batch.length;
        if (progressCallback) {
          progressCallback(currentCount, uniqueStats.length);
        }
        
        // Petite pause pour éviter de surcharger la base de données
        if (uniqueChunks.length > 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Erreur lors de l'insertion du lot ${index + 1}:`, error);
      }
    }
    
    if (skippedCount > 0) {
      toast.warning(`${skippedCount} statistiques d'équipe ont été ignorées car les matchs associés n'existent pas.`);
    }
    
    console.log(`${uniqueStats.length} statistiques d'équipe par match sauvegardées avec succès.`);
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des statistiques d\'équipe:', error);
    toast.error(`Erreur lors de la sauvegarde des statistiques d'équipe: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return false;
  }
}
