
import { supabase } from '@/integrations/supabase/client';
import { Match } from '../../models/types';
import { savePlayerMatchStats } from './playerStats';

/**
 * Transform a match object to a database-compatible format
 */
const formatMatchForDatabase = (match: Match) => {
  // Convert the score to the correct type (number) for Supabase
  let scoreBlue: number | null = null;
  let scoreRed: number | null = null;
  
  if (match.result?.score) {
    scoreBlue = match.result.score[0];
    scoreRed = match.result.score[1];
  }
  
  return {
    id: match.id,
    tournament: match.tournament,
    date: match.date,
    team_blue_id: match.teamBlue.id,
    team_red_id: match.teamRed.id,
    predicted_winner: match.predictedWinner,
    blue_win_odds: match.blueWinOdds,
    red_win_odds: match.redWinOdds,
    status: match.status,
    winner_team_id: match.result?.winner,
    score_blue: scoreBlue,
    score_red: scoreRed,
    duration: match.result?.duration,
    mvp: match.result?.mvp,
    first_blood: match.result?.firstBlood,
    first_dragon: match.result?.firstDragon,
    first_baron: match.result?.firstBaron,
    // Add extra stats if available
    patch: match.extraStats?.patch,
    year: match.extraStats?.year,
    split: match.extraStats?.split,
    playoffs: match.extraStats?.playoffs || false,
    team_kpm: match.extraStats?.team_kpm,
    ckpm: match.extraStats?.ckpm,
    team_kills: match.extraStats?.team_kills,
    team_deaths: match.extraStats?.team_deaths,
    dragons: match.extraStats?.dragons,
    opp_dragons: match.extraStats?.opp_dragons,
    elemental_drakes: match.extraStats?.elemental_drakes,
    opp_elemental_drakes: match.extraStats?.opp_elemental_drakes,
    infernals: match.extraStats?.infernals,
    mountains: match.extraStats?.mountains,
    clouds: match.extraStats?.clouds,
    oceans: match.extraStats?.oceans,
    chemtechs: match.extraStats?.chemtechs,
    hextechs: match.extraStats?.hextechs,
    drakes_unknown: match.extraStats?.drakes_unknown,
    elders: match.extraStats?.elders,
    opp_elders: match.extraStats?.opp_elders,
    first_herald: match.extraStats?.first_herald,
    heralds: match.extraStats?.heralds,
    opp_heralds: match.extraStats?.opp_heralds,
    barons: match.extraStats?.barons,
    opp_barons: match.extraStats?.opp_barons,
    void_grubs: match.extraStats?.void_grubs,
    opp_void_grubs: match.extraStats?.opp_void_grubs,
    first_tower: match.extraStats?.first_tower,
    first_mid_tower: match.extraStats?.first_mid_tower,
    first_three_towers: match.extraStats?.first_three_towers,
    towers: match.extraStats?.towers,
    opp_towers: match.extraStats?.opp_towers,
    turret_plates: match.extraStats?.turret_plates,
    opp_turret_plates: match.extraStats?.opp_turret_plates,
    inhibitors: match.extraStats?.inhibitors,
    opp_inhibitors: match.extraStats?.opp_inhibitors
  };
};

/**
 * Save matches to the database
 */
export const saveMatches = async (matches: Match[]): Promise<boolean> => {
  try {
    console.log(`Sauvegarde de ${matches.length} matchs dans la base de données`);
    
    // Prepare matches for database insertion
    const dbMatches = matches.map(formatMatchForDatabase);
    
    // Insert matches one by one to avoid the error with the upsert operation
    for (const dbMatch of dbMatches) {
      const { error } = await supabase
        .from('matches')
        .upsert(dbMatch);
      
      if (error) {
        console.error("Erreur lors de la sauvegarde du match:", error);
        return false;
      }
    }
    
    // Save player match stats if available
    let playerStatsSuccess = true;
    for (const match of matches) {
      if (match.playerStats && match.playerStats.length > 0) {
        const success = await savePlayerMatchStats(match);
        if (!success) {
          playerStatsSuccess = false;
        }
      }
    }
    
    return playerStatsSuccess;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des matchs:", error);
    return false;
  }
};
