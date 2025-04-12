
import { supabase } from '@/integrations/supabase/client';
import { Match } from '../../models/types';
import { chunk } from '../../dataConverter';
import { toast } from "sonner";
import { booleanToString, prepareJsonData } from '../../leagueData/utils';

// Import the clearMatchCache function from getMatches
import { clearMatchCache } from './getMatches';

/**
 * Save matches to the database
 */
export const saveMatches = async (matches: Match[]): Promise<boolean> => {
  try {
    console.log(`Enregistrement de ${matches.length} matchs dans Supabase`);
    
    // Clear cache
    clearMatchCache();
    
    // Check for duplicate match IDs
    const matchIds = matches.map(match => match.id);
    const uniqueMatchIds = new Set(matchIds);
    
    if (uniqueMatchIds.size !== matches.length) {
      console.warn(`Trouvé ${matches.length - uniqueMatchIds.size} IDs de match en double`);
      
      // Filter out duplicates, keeping only the first occurrence of each ID
      const seenIds = new Set<string>();
      const uniqueMatches = matches.filter(match => {
        if (seenIds.has(match.id)) {
          return false;
        }
        seenIds.add(match.id);
        return true;
      });
      
      console.log(`Filtré à ${uniqueMatches.length} matchs uniques`);
      
      // Use the filtered list
      matches = uniqueMatches;
    }
    
    // Insert matches in batches of 50 using upsert
    const matchChunks = chunk(matches, 50);
    let successCount = 0;
    
    for (const matchChunk of matchChunks) {
      try {
        // Debug match data for better debugging
        console.log(`Traitement d'un lot de ${matchChunk.length} matchs avec données d'objectifs`);
        
        // Log a sample match to verify data
        if (matchChunk.length > 0) {
          const sampleMatch = matchChunk[0];
          console.log('Exemple de données de match:', {
            id: sampleMatch.id,
            extraStats: sampleMatch.extraStats ? {
              dragons: sampleMatch.extraStats.dragons,
              barons: sampleMatch.extraStats.barons,
              first_blood: sampleMatch.extraStats.first_blood,
              first_blood_type: typeof sampleMatch.extraStats.first_blood,
              picks: sampleMatch.extraStats.picks ? Object.keys(sampleMatch.extraStats.picks).length : 'Pas de picks',
              bans: sampleMatch.extraStats.bans ? Object.keys(sampleMatch.extraStats.bans).length : 'Pas de bans'
            } : 'Pas de extraStats',
            result: sampleMatch.result ? {
              winner: sampleMatch.result.winner,
              firstBlood: sampleMatch.result.firstBlood,
              firstDragon: sampleMatch.result.firstDragon
            } : 'Pas de résultat'
          });
        }
        
        const { error: matchesError } = await supabase
          .from('matches')
          .upsert(
            matchChunk.map(match => {
              // Ensure extraStats and result objects exist
              const extraStats = match.extraStats || {};
              const result = match.result || {};
              
              // Ensure other required properties are available
              const teamBlueId = match.teamBlue?.id || '';
              const teamRedId = match.teamRed?.id || '';
              
              // Process picks and bans to ensure they are in the correct JSON format
              // This is critical to ensure they're stored properly in the database
              let picksData = null;
              let bansData = null;
              
              if (extraStats.picks) {
                picksData = prepareJsonData(extraStats.picks);
                console.log(`Match ${match.id} - Picks data ready for DB:`, 
                  picksData ? `${Object.keys(picksData).length} picks found` : 'No picks');
              }
              
              if (extraStats.bans) {
                bansData = prepareJsonData(extraStats.bans);
                console.log(`Match ${match.id} - Bans data ready for DB:`, 
                  bansData ? `${Object.keys(bansData).length} bans found` : 'No bans');
              }
              
              // Log objective data for this match
              console.log(`Match ${match.id} données d'objectifs et picks/bans pour la BD:`, {
                dragons: extraStats.dragons || 0,
                barons: extraStats.barons || 0,
                first_blood: extraStats.first_blood,
                first_blood_processed: booleanToString(extraStats.first_blood) || booleanToString(result.firstBlood) || null,
                hasPicks: !!picksData,
                hasBans: !!bansData,
                picksCount: picksData ? Object.keys(picksData).length : 0,
                bansCount: bansData ? Object.keys(bansData).length : 0
              });
              
              // CORRECTION: Meilleure gestion des valeurs booléennes
              // Fonction améliorée pour mieux traiter les valeurs booléennes et les convertir correctement
              const processBoolean = (value: any): string | null => {
                if (value === undefined || value === null) return null;
                
                if (typeof value === 'boolean') return value ? teamId : null;
                if (typeof value === 'string') {
                  const lowerValue = value.toLowerCase().trim();
                  if (['true', '1', 'yes', 'oui', 't', 'y'].includes(lowerValue)) return teamId;
                  if (['false', '0', 'no', 'non', 'f', 'n'].includes(lowerValue)) return null;
                  // Si c'est un ID d'équipe, le retourner tel quel
                  return value;
                }
                if (typeof value === 'number') return value === 1 ? teamId : null;
                
                return null;
              };
              
              // Récupérer l'ID de l'équipe pour les valeurs booléennes
              const teamId = match.id.includes('_') ? match.id.split('_')[0] : '';
              
              // Assemble match object with safe property access and proper boolean -> string conversion
              return {
                id: match.id,
                tournament: match.tournament || '',
                date: match.date || '',
                team_blue_id: teamBlueId,
                team_red_id: teamRedId,
                predicted_winner: match.predictedWinner || '',
                blue_win_odds: match.blueWinOdds || 0,
                red_win_odds: match.redWinOdds || 0,
                status: match.status || 'Upcoming',
                patch: extraStats.patch || '',
                year: extraStats.year || '',
                split: extraStats.split || '',
                playoffs: extraStats.playoffs || false,
                team_kpm: extraStats.team_kpm || 0,
                ckpm: extraStats.ckpm || 0,
                team_kills: extraStats.team_kills || 0,
                team_deaths: extraStats.team_deaths || 0,
                dragons: extraStats.dragons || 0,
                opp_dragons: extraStats.opp_dragons || 0,
                elemental_drakes: extraStats.elemental_drakes || 0,
                opp_elemental_drakes: extraStats.opp_elemental_drakes || 0,
                infernals: extraStats.infernals || 0,
                mountains: extraStats.mountains || 0,
                clouds: extraStats.clouds || 0,
                oceans: extraStats.oceans || 0,
                chemtechs: extraStats.chemtechs || 0,
                hextechs: extraStats.hextechs || 0,
                drakes_unknown: extraStats.drakes_unknown || 0,
                elders: extraStats.elders || 0,
                opp_elders: extraStats.opp_elders || 0,
                // CORRECTION: Utilisation de la nouvelle fonction processBoolean pour les valeurs booléennes
                first_herald: booleanToString(extraStats.first_herald !== undefined ? extraStats.first_herald : (result && 'firstHerald' in result ? result.firstHerald : null)),
                heralds: extraStats.heralds || 0,
                opp_heralds: extraStats.opp_heralds || 0,
                first_baron: booleanToString(extraStats.first_baron !== undefined ? extraStats.first_baron : (result && 'firstBaron' in result ? result.firstBaron : null)),
                barons: extraStats.barons || 0,
                opp_barons: extraStats.opp_barons || 0,
                void_grubs: extraStats.void_grubs || 0,
                opp_void_grubs: extraStats.opp_void_grubs || 0,
                first_tower: booleanToString(extraStats.first_tower !== undefined ? extraStats.first_tower : (result && 'firstTower' in result ? result.firstTower : null)),
                first_mid_tower: booleanToString(extraStats.first_mid_tower),
                first_three_towers: booleanToString(extraStats.first_three_towers),
                towers: extraStats.towers || 0,
                opp_towers: extraStats.opp_towers || 0,
                turret_plates: extraStats.turret_plates || 0,
                opp_turret_plates: extraStats.opp_turret_plates || 0,
                inhibitors: extraStats.inhibitors || 0,
                opp_inhibitors: extraStats.opp_inhibitors || 0,
                winner_team_id: result && 'winner' in result ? result.winner : null,
                score_blue: result && 'score' in result && Array.isArray(result.score) && result.score.length > 0 ? result.score[0] : 0,
                score_red: result && 'score' in result && Array.isArray(result.score) && result.score.length > 1 ? result.score[1] : 0,
                duration: result && 'duration' in result ? result.duration : '',
                mvp: result && 'mvp' in result ? result.mvp : '',
                // CORRECTION: Meilleure gestion des valeurs booléennes first_blood
                first_blood: booleanToString(extraStats.first_blood !== undefined ? extraStats.first_blood : (result && 'firstBlood' in result ? result.firstBlood : null)),
                first_dragon: booleanToString(extraStats.first_dragon !== undefined ? extraStats.first_dragon : (result && 'firstDragon' in result ? result.firstDragon : null)),
                picks: picksData,
                bans: bansData,
                game_number: match.id.includes('_') ? match.id.split('_').pop() || null : null
              };
            }),
            { onConflict: 'id' }
          );
        
        if (matchesError) {
          console.error("Erreur lors de la mise à jour des matchs:", matchesError);
          toast.error(`Erreur lors de la mise à jour des matchs: ${matchesError.message}`);
          continue; // Continue with the next batch
        }
        
        successCount += matchChunk.length;
      } catch (error) {
        console.error("Erreur lors du traitement du lot de matchs:", error);
        continue; // Continue with next batch
      }
    }
    
    console.log(`Mise à jour réussie pour ${successCount}/${matches.length} matchs`);
    return successCount > 0;
  } catch (error) {
    console.error("Erreur lors de l'enregistrement des matchs:", error);
    toast.error("Une erreur s'est produite lors de l'enregistrement des matchs");
    return false;
  }
};
