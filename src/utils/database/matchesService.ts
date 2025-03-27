
import { supabase } from '@/integrations/supabase/client';
import { Team, Match, Player } from '../models/types';
import { Json } from '@/integrations/supabase/types';

// Get all matches from the database
export const getMatches = async (): Promise<Match[]> => {
  try {
    const { data: matches, error } = await supabase
      .from('matches')
      .select('*');
    
    if (error) {
      console.error("Erreur lors de la récupération des matchs:", error);
      return [];
    }
    
    // Fetch teams separately to populate the match data
    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .select('*');
    
    if (teamsError) {
      console.error("Erreur lors de la récupération des équipes:", teamsError);
      return [];
    }
    
    // Convert database format to application format
    const formattedMatches: Match[] = matches.map(match => {
      const teamBlueData = teamsData.find(team => team.id === match.team_blue_id);
      const teamRedData = teamsData.find(team => team.id === match.team_red_id);
      
      if (!teamBlueData || !teamRedData) {
        console.error(`Équipes non trouvées pour le match ${match.id}`);
        return null;
      }
      
      // Convert team data to Team type
      const teamBlue: Team = {
        id: teamBlueData.id,
        name: teamBlueData.name,
        logo: teamBlueData.logo,
        region: teamBlueData.region,
        winRate: Number(teamBlueData.win_rate) || 0,
        blueWinRate: Number(teamBlueData.blue_win_rate) || 0,
        redWinRate: Number(teamBlueData.red_win_rate) || 0,
        averageGameTime: Number(teamBlueData.average_game_time) || 0,
        players: []
      };
      
      const teamRed: Team = {
        id: teamRedData.id,
        name: teamRedData.name,
        logo: teamRedData.logo,
        region: teamRedData.region,
        winRate: Number(teamRedData.win_rate) || 0,
        blueWinRate: Number(teamRedData.blue_win_rate) || 0,
        redWinRate: Number(teamRedData.red_win_rate) || 0,
        averageGameTime: Number(teamRedData.average_game_time) || 0,
        players: []
      };
      
      const formattedMatch: Match = {
        id: match.id,
        tournament: match.tournament,
        date: match.date,
        teamBlue,
        teamRed,
        predictedWinner: match.predicted_winner,
        blueWinOdds: match.blue_win_odds,
        redWinOdds: match.red_win_odds,
        status: match.status as 'Upcoming' | 'Live' | 'Completed',
        extraStats: {
          patch: match.patch,
          year: match.year,
          split: match.split,
          playoffs: match.playoffs === true,
          team_kpm: match.team_kpm,
          ckpm: match.ckpm,
          team_kills: match.team_kills,
          team_deaths: match.team_deaths,
          dragons: match.dragons,
          opp_dragons: match.opp_dragons,
          elemental_drakes: match.elemental_drakes,
          opp_elemental_drakes: match.opp_elemental_drakes,
          infernals: match.infernals,
          mountains: match.mountains,
          clouds: match.clouds,
          oceans: match.oceans,
          chemtechs: match.chemtechs,
          hextechs: match.hextechs,
          drakes_unknown: match.drakes_unknown,
          elders: match.elders,
          opp_elders: match.opp_elders,
          first_herald: match.first_herald,
          heralds: match.heralds,
          opp_heralds: match.opp_heralds,
          barons: match.barons,
          opp_barons: match.opp_barons,
          void_grubs: match.void_grubs,
          opp_void_grubs: match.opp_void_grubs,
          first_tower: match.first_tower,
          first_mid_tower: match.first_mid_tower,
          first_three_towers: match.first_three_towers,
          towers: match.towers,
          opp_towers: match.opp_towers,
          turret_plates: match.turret_plates,
          opp_turret_plates: match.opp_turret_plates,
          inhibitors: match.inhibitors,
          opp_inhibitors: match.opp_inhibitors
        }
      };
      
      if (match.status === 'Completed' && match.winner_team_id) {
        formattedMatch.result = {
          winner: match.winner_team_id,
          score: [
            typeof match.score_blue === 'string' ? parseInt(match.score_blue) : match.score_blue || 0, 
            typeof match.score_red === 'string' ? parseInt(match.score_red) : match.score_red || 0
          ],
          duration: match.duration,
          mvp: match.mvp,
          firstBlood: match.first_blood,
          firstDragon: match.first_dragon,
          firstBaron: match.first_baron
        };
      }
      
      return formattedMatch;
    }).filter(match => match !== null) as Match[];
    
    // Fetch player match stats
    for (const match of formattedMatches) {
      const { data: playerStats, error: statsError } = await supabase
        .from('player_match_stats')
        .select('*')
        .eq('match_id', match.id);
      
      if (statsError) {
        console.error(`Erreur lors de la récupération des stats des joueurs pour le match ${match.id}:`, statsError);
      } else if (playerStats && playerStats.length > 0) {
        match.playerStats = playerStats;
      }
    }
    
    return formattedMatches;
  } catch (error) {
    console.error("Erreur lors de la récupération des matchs:", error);
    return [];
  }
};

// Get player match statistics
export const getPlayerMatchStats = async (playerId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('player_match_stats')
      .select('*')
      .eq('player_id', playerId);
    
    if (error) {
      console.error("Erreur lors de la récupération des statistiques du joueur:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques du joueur:", error);
    return [];
  }
};

// Save matches to the database
export const saveMatches = async (matches: Match[]): Promise<boolean> => {
  try {
    console.log(`Sauvegarde de ${matches.length} matchs dans la base de données`);
    
    // Prepare matches for database insertion
    const dbMatches = matches.map(match => {
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
    });
    
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
        // Filter out player stats with missing player_id or team_id
        const validPlayerStats = match.playerStats.filter(
          stat => stat.player_id && stat.player_id.trim() !== '' && 
                 stat.team_id && stat.team_id.trim() !== ''
        );
        
        if (validPlayerStats.length !== match.playerStats.length) {
          console.log(`Match ${match.id}: Filtered out ${match.playerStats.length - validPlayerStats.length} player stats with missing IDs`);
        }
        
        // Prepare player stats for database insertion
        const dbPlayerStats = validPlayerStats.map(stat => ({
          match_id: match.id,
          player_id: stat.player_id,
          team_id: stat.team_id,
          participant_id: stat.participant_id,
          side: stat.side,
          position: stat.position,
          champion: stat.champion,
          kills: stat.kills,
          deaths: stat.deaths,
          assists: stat.assists,
          double_kills: stat.double_kills,
          triple_kills: stat.triple_kills,
          quadra_kills: stat.quadra_kills,
          penta_kills: stat.penta_kills,
          first_blood_kill: stat.first_blood_kill,
          first_blood_assist: stat.first_blood_assist,
          first_blood_victim: stat.first_blood_victim,
          damage_to_champions: stat.damage_to_champions,
          dpm: stat.dpm,
          damage_share: stat.damage_share,
          damage_taken_per_minute: stat.damage_taken_per_minute,
          damage_mitigated_per_minute: stat.damage_mitigated_per_minute,
          wards_placed: stat.wards_placed,
          wpm: stat.wpm,
          wards_killed: stat.wards_killed,
          wcpm: stat.wcpm,
          control_wards_bought: stat.control_wards_bought,
          vision_score: stat.vision_score,
          vspm: stat.vspm,
          total_gold: stat.total_gold,
          earned_gold: stat.earned_gold,
          earned_gpm: stat.earned_gpm,
          earned_gold_share: stat.earned_gold_share,
          gold_spent: stat.gold_spent,
          gspd: stat.gspd,
          gpr: stat.gpr,
          total_cs: stat.total_cs,
          minion_kills: stat.minion_kills,
          monster_kills: stat.monster_kills,
          monster_kills_own_jungle: stat.monster_kills_own_jungle,
          monster_kills_enemy_jungle: stat.monster_kills_enemy_jungle,
          cspm: stat.cspm,
          gold_at_10: stat.gold_at_10,
          xp_at_10: stat.xp_at_10,
          cs_at_10: stat.cs_at_10,
          opp_gold_at_10: stat.opp_gold_at_10,
          opp_xp_at_10: stat.opp_xp_at_10,
          opp_cs_at_10: stat.opp_cs_at_10,
          gold_diff_at_10: stat.gold_diff_at_10,
          xp_diff_at_10: stat.xp_diff_at_10,
          cs_diff_at_10: stat.cs_diff_at_10,
          kills_at_10: stat.kills_at_10,
          assists_at_10: stat.assists_at_10,
          deaths_at_10: stat.deaths_at_10,
          opp_kills_at_10: stat.opp_kills_at_10,
          opp_assists_at_10: stat.opp_assists_at_10,
          opp_deaths_at_10: stat.opp_deaths_at_10,
          gold_at_15: stat.gold_at_15,
          xp_at_15: stat.xp_at_15,
          cs_at_15: stat.cs_at_15,
          opp_gold_at_15: stat.opp_gold_at_15,
          opp_xp_at_15: stat.opp_xp_at_15,
          opp_cs_at_15: stat.opp_cs_at_15,
          gold_diff_at_15: stat.gold_diff_at_15,
          xp_diff_at_15: stat.xp_diff_at_15,
          cs_diff_at_15: stat.cs_diff_at_15,
          kills_at_15: stat.kills_at_15,
          assists_at_15: stat.assists_at_15,
          deaths_at_15: stat.deaths_at_15,
          opp_kills_at_15: stat.opp_kills_at_15,
          opp_assists_at_15: stat.opp_assists_at_15,
          opp_deaths_at_15: stat.opp_deaths_at_15,
          gold_at_20: stat.gold_at_20,
          xp_at_20: stat.xp_at_20,
          cs_at_20: stat.cs_at_20,
          opp_gold_at_20: stat.opp_gold_at_20,
          opp_xp_at_20: stat.opp_xp_at_20,
          opp_cs_at_20: stat.opp_cs_at_20,
          gold_diff_at_20: stat.gold_diff_at_20,
          xp_diff_at_20: stat.xp_diff_at_20,
          cs_diff_at_20: stat.cs_diff_at_20,
          kills_at_20: stat.kills_at_20,
          assists_at_20: stat.assists_at_20,
          deaths_at_20: stat.deaths_at_20,
          opp_kills_at_20: stat.opp_kills_at_20,
          opp_assists_at_20: stat.opp_assists_at_20,
          opp_deaths_at_20: stat.opp_deaths_at_20,
          gold_at_25: stat.gold_at_25,
          xp_at_25: stat.xp_at_25,
          cs_at_25: stat.cs_at_25,
          opp_gold_at_25: stat.opp_gold_at_25,
          opp_xp_at_25: stat.opp_xp_at_25,
          opp_cs_at_25: stat.opp_cs_at_25,
          gold_diff_at_25: stat.gold_diff_at_25,
          xp_diff_at_25: stat.xp_diff_at_25,
          cs_diff_at_25: stat.cs_diff_at_25,
          kills_at_25: stat.kills_at_25,
          assists_at_25: stat.assists_at_25,
          deaths_at_25: stat.deaths_at_25,
          opp_kills_at_25: stat.opp_kills_at_25,
          opp_assists_at_25: stat.opp_assists_at_25,
          opp_deaths_at_25: stat.opp_deaths_at_25
        }));
        
        if (dbPlayerStats.length > 0) {
          // Insert player stats
          const { error: statsError } = await supabase
            .from('player_match_stats')
            .upsert(dbPlayerStats);
          
          if (statsError) {
            console.error("Erreur lors de la sauvegarde des statistiques des joueurs:", statsError);
            console.error("Détails de l'erreur:", statsError.details);
            playerStatsSuccess = false;
          } else {
            console.log(`Match ${match.id}: ${dbPlayerStats.length} player stats inserted successfully`);
          }
        }
      }
    }
    
    return playerStatsSuccess;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des matchs:", error);
    return false;
  }
};
