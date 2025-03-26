
import { supabase } from "@/integrations/supabase/client";
import { Match } from '../mockData';
import { chunk } from '../dataConverter';
import { getLoadedMatches, setLoadedMatches } from '../csvTypes';
import { getTeams } from './teamsService';

// Save matches to database
export const saveMatches = async (matches: Match[]): Promise<boolean> => {
  try {
    // Insérer les matchs par lots de 100
    const matchChunks = chunk(matches, 100);
    
    for (const matchChunk of matchChunks) {
      const { error: matchesError } = await supabase.from('matches').insert(
        matchChunk.map(match => {
          const baseMatchData = {
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
            score_blue: match.result?.score ? match.result.score[0] : null,
            score_red: match.result?.score ? match.result.score[1] : null,
            duration: match.result?.duration,
            mvp: match.result?.mvp,
            first_blood: match.result?.firstBlood,
            first_dragon: match.result?.firstDragon,
            first_baron: match.result?.firstBaron
          };
          
          // Add additional fields from the extended schema
          if (match.extraStats?.blueTeamStats) {
            const blueStats = match.extraStats.blueTeamStats;
            baseMatchData['team_kpm'] = blueStats.team_kpm;
            baseMatchData['ckpm'] = blueStats.ckpm;
            baseMatchData['team_kills'] = blueStats.team_kills;
            baseMatchData['team_deaths'] = blueStats.team_deaths;
            
            // Dragon stats
            baseMatchData['dragons'] = blueStats.dragons;
            baseMatchData['opp_dragons'] = blueStats.opp_dragons;
            baseMatchData['elemental_drakes'] = blueStats.elemental_drakes;
            baseMatchData['opp_elemental_drakes'] = blueStats.opp_elemental_drakes;
            baseMatchData['infernals'] = blueStats.infernals;
            baseMatchData['mountains'] = blueStats.mountains;
            baseMatchData['clouds'] = blueStats.clouds;
            baseMatchData['oceans'] = blueStats.oceans;
            baseMatchData['chemtechs'] = blueStats.chemtechs;
            baseMatchData['hextechs'] = blueStats.hextechs;
            baseMatchData['drakes_unknown'] = blueStats.drakes_unknown;
            baseMatchData['elders'] = blueStats.elders;
            baseMatchData['opp_elders'] = blueStats.opp_elders;
            
            // Herald and Baron
            baseMatchData['first_herald'] = blueStats.first_herald ? match.teamBlue.id : null;
            baseMatchData['heralds'] = blueStats.heralds;
            baseMatchData['opp_heralds'] = blueStats.opp_heralds;
            baseMatchData['barons'] = blueStats.barons;
            baseMatchData['opp_barons'] = blueStats.opp_barons;
            
            // Tower stats
            baseMatchData['first_tower'] = blueStats.first_tower ? match.teamBlue.id : null;
            baseMatchData['first_mid_tower'] = blueStats.first_mid_tower ? match.teamBlue.id : null;
            baseMatchData['first_three_towers'] = blueStats.first_three_towers ? match.teamBlue.id : null;
            baseMatchData['towers'] = blueStats.towers;
            baseMatchData['opp_towers'] = blueStats.opp_towers;
            baseMatchData['turret_plates'] = blueStats.turret_plates;
            baseMatchData['opp_turret_plates'] = blueStats.opp_turret_plates;
            baseMatchData['inhibitors'] = blueStats.inhibitors;
            baseMatchData['opp_inhibitors'] = blueStats.opp_inhibitors;
            
            // New creatures
            baseMatchData['void_grubs'] = blueStats.void_grubs;
            baseMatchData['opp_void_grubs'] = blueStats.opp_void_grubs;
          }
          
          return baseMatchData;
        })
      );
      
      if (matchesError) {
        console.error("Erreur lors de l'insertion des matchs:", matchesError);
        return false;
      }
    }
    
    // Save player match stats if available
    let playerStatsToSave = [];
    
    for (const match of matches) {
      if (match.playerStats && match.playerStats.length > 0) {
        playerStatsToSave = [...playerStatsToSave, ...match.playerStats];
      }
    }
    
    if (playerStatsToSave.length > 0) {
      const playerStatsChunks = chunk(playerStatsToSave, 100);
      
      for (const statsChunk of playerStatsChunks) {
        const { error: statsError } = await supabase.from('player_match_stats').insert(statsChunk);
        
        if (statsError) {
          console.error("Erreur lors de l'insertion des statistiques de joueurs:", statsError);
          // Continue with the process even if player stats insertion fails
        }
      }
      
      console.log(`${playerStatsToSave.length} statistiques de joueurs par match insérées`);
    }
    
    console.log("Matchs insérés avec succès");
    return true;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des matchs:", error);
    return false;
  }
};

// Get matches from database
export const getMatches = async (): Promise<Match[]> => {
  const loadedMatches = getLoadedMatches();
  if (loadedMatches) return loadedMatches;
  
  try {
    const { data: matchesData, error: matchesError } = await supabase
      .from('matches')
      .select('*');
    
    if (matchesError || !matchesData || matchesData.length === 0) {
      console.error("Erreur lors de la récupération des matchs:", matchesError);
      const { matches } = await import('../mockData');
      return matches;
    }
    
    const teams = await getTeams();
    
    const matches: Match[] = matchesData.map(match => {
      const teamBlue = teams.find(t => t.id === match.team_blue_id) || teams[0];
      const teamRed = teams.find(t => t.id === match.team_red_id) || teams[1];
      
      const matchObject: Match = {
        id: match.id as string,
        tournament: match.tournament as string,
        date: match.date as string,
        teamBlue,
        teamRed,
        predictedWinner: match.predicted_winner as string,
        blueWinOdds: Number(match.blue_win_odds) || 0.5,
        redWinOdds: Number(match.red_win_odds) || 0.5,
        status: (match.status || 'Upcoming') as 'Upcoming' | 'Live' | 'Completed'
      };
      
      if (match.status === 'Completed' && match.winner_team_id) {
        matchObject.result = {
          winner: match.winner_team_id as string,
          score: [Number(match.score_blue) || 0, Number(match.score_red) || 0],
          duration: match.duration as string | undefined,
          mvp: match.mvp as string | undefined,
          firstBlood: match.first_blood as string | undefined,
          firstDragon: match.first_dragon as string | undefined,
          firstBaron: match.first_baron as string | undefined
        };
      }
      
      // Add extended stats if available
      if (match.team_kpm || match.dragons || match.first_tower) {
        matchObject.extraStats = {
          patch: match.patch as string,
          year: match.year as string,
          split: match.split as string,
          playoffs: match.playoffs === 'yes',
          team_kpm: Number(match.team_kpm) || 0,
          ckpm: Number(match.ckpm) || 0,
          team_kills: Number(match.team_kills) || 0,
          team_deaths: Number(match.team_deaths) || 0,
          
          // Dragon stats
          dragons: Number(match.dragons) || 0,
          opp_dragons: Number(match.opp_dragons) || 0,
          elemental_drakes: Number(match.elemental_drakes) || 0,
          opp_elemental_drakes: Number(match.opp_elemental_drakes) || 0,
          infernals: Number(match.infernals) || 0,
          mountains: Number(match.mountains) || 0,
          clouds: Number(match.clouds) || 0,
          oceans: Number(match.oceans) || 0,
          chemtechs: Number(match.chemtechs) || 0,
          hextechs: Number(match.hextechs) || 0,
          drakes_unknown: Number(match.drakes_unknown) || 0,
          elders: Number(match.elders) || 0,
          opp_elders: Number(match.opp_elders) || 0,
          
          // Herald and Baron
          first_herald: match.first_herald as string,
          heralds: Number(match.heralds) || 0,
          opp_heralds: Number(match.opp_heralds) || 0,
          barons: Number(match.barons) || 0,
          opp_barons: Number(match.opp_barons) || 0,
          
          // Tower stats
          first_tower: match.first_tower as string,
          first_mid_tower: match.first_mid_tower as string,
          first_three_towers: match.first_three_towers as string,
          towers: Number(match.towers) || 0,
          opp_towers: Number(match.opp_towers) || 0,
          turret_plates: Number(match.turret_plates) || 0,
          opp_turret_plates: Number(match.opp_turret_plates) || 0,
          inhibitors: Number(match.inhibitors) || 0,
          opp_inhibitors: Number(match.opp_inhibitors) || 0,
          
          // New creatures
          void_grubs: Number(match.void_grubs) || 0,
          opp_void_grubs: Number(match.opp_void_grubs) || 0,
        };
      }
      
      return matchObject;
    });
    
    // Get player match stats
    try {
      const { data: playerStatsData } = await supabase
        .from('player_match_stats')
        .select('*');
      
      if (playerStatsData && playerStatsData.length > 0) {
        // Group player stats by match ID
        const playerStatsByMatch = playerStatsData.reduce((acc, stat) => {
          if (!acc[stat.match_id]) {
            acc[stat.match_id] = [];
          }
          acc[stat.match_id].push(stat);
          return acc;
        }, {});
        
        // Attach player stats to matches
        matches.forEach(match => {
          if (playerStatsByMatch[match.id]) {
            match.playerStats = playerStatsByMatch[match.id];
          }
        });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques de joueurs:", error);
    }
    
    setLoadedMatches(matches);
    return matches;
  } catch (error) {
    console.error("Erreur lors de la récupération des matchs:", error);
    const { matches } = await import('../mockData');
    return matches;
  }
};

// Get player match stats for a specific player
export const getPlayerMatchStats = async (playerId: string) => {
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
