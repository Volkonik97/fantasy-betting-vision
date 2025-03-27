import { supabase } from "@/integrations/supabase/client";
import { Team, SideStatistics } from '../models/types';
import { chunk } from '../dataConverter';
import { getLoadedTeams, setLoadedTeams } from '../csvTypes';
import { getPlayers } from './playersService';
import { getMockSideStatistics } from '../statistics'; // Updated import

// Save teams to database
export const saveTeams = async (teams: Team[]): Promise<boolean> => {
  try {
    // Insérer les équipes par lots de 100
    const teamChunks = chunk(teams, 100);
    for (const teamChunk of teamChunks) {
      const { error: teamsError } = await supabase.from('teams').insert(
        teamChunk.map(team => ({
          id: team.id,
          name: team.name,
          logo: team.logo,
          region: team.region,
          win_rate: team.winRate,
          blue_win_rate: team.blueWinRate,
          red_win_rate: team.redWinRate,
          average_game_time: team.averageGameTime // Stocké en secondes
        }))
      );
      
      if (teamsError) {
        console.error("Erreur lors de l'insertion des équipes:", teamsError);
        return false;
      }
    }
    
    console.log("Équipes insérées avec succès");
    return true;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des équipes:", error);
    return false;
  }
};

// Get teams from database
export const getTeams = async (): Promise<Team[]> => {
  const loadedTeams = getLoadedTeams();
  if (loadedTeams) return loadedTeams;
  
  try {
    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .select('*');
    
    if (teamsError || !teamsData || teamsData.length === 0) {
      console.error("Erreur lors de la récupération des équipes:", teamsError);
      const { teams } = await import('../mockData');
      return teams;
    }
    
    const { data: playersData, error: playersError } = await supabase
      .from('players')
      .select('*');
    
    if (playersError) {
      console.error("Erreur lors de la récupération des joueurs:", playersError);
    }
    
    const teams: Team[] = teamsData.map(team => ({
      id: team.id as string,
      name: team.name as string,
      logo: team.logo as string,
      region: team.region as string,
      winRate: Number(team.win_rate) || 0,
      blueWinRate: Number(team.blue_win_rate) || 0,
      redWinRate: Number(team.red_win_rate) || 0,
      averageGameTime: Number(team.average_game_time) || 0, // Récupéré en secondes
      players: []
    }));
    
    if (playersData) {
      teams.forEach(team => {
        team.players = playersData
          .filter(player => player.team_id === team.id)
          .map(player => ({
            id: player.id as string,
            name: player.name as string,
            role: (player.role || 'Mid') as 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support',
            image: player.image as string,
            team: player.team_id as string,
            kda: Number(player.kda) || 0,
            csPerMin: Number(player.cs_per_min) || 0,
            damageShare: Number(player.damage_share) || 0,
            championPool: player.champion_pool as string[] || []
          }));
      });
    }
    
    setLoadedTeams(teams);
    return teams;
  } catch (error) {
    console.error("Erreur lors de la récupération des équipes:", error);
    const { teams } = await import('../mockData');
    return teams;
  }
};

// Get side statistics for a team
export const getSideStatistics = async (teamId: string): Promise<SideStatistics> => {
  console.log(`[teamsService] Fetching side statistics for team: ${teamId}`);
  try {
    // Check if team exists in database
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();
    
    if (teamError || !teamData) {
      console.log(`[teamsService] Team ${teamId} not found in database, using mock data`);
      return getMockSideStatistics(teamId);
    }
    
    // Get matches for this team
    const { data: matchesData, error: matchesError } = await supabase
      .from('matches')
      .select('*')
      .or(`team_blue_id.eq.${teamId},team_red_id.eq.${teamId}`);
    
    console.log(`[teamsService] Matches query result:`, { 
      error: matchesError, 
      matchCount: matchesData?.length || 0
    });
    
    if (matchesError || !matchesData || matchesData.length === 0) {
      console.log(`[teamsService] No matches found for team ${teamId}, using mock data`);
      return getMockSideStatistics(teamId);
    }
    
    console.log(`[teamsService] Found ${matchesData.length} matches for team ${teamId}`);
    
    // Calculate statistics based on matches
    const blueMatches = matchesData.filter(m => m.team_blue_id === teamId);
    const redMatches = matchesData.filter(m => m.team_red_id === teamId);
    
    const blueMatchCount = blueMatches.length;
    const redMatchCount = redMatches.length;
    
    console.log(`[teamsService] Blue matches: ${blueMatchCount}, Red matches: ${redMatchCount}`);
    
    // Calculate win rates
    const blueWins = blueMatches.filter(m => m.winner_team_id === teamId).length;
    const redWins = redMatches.filter(m => m.winner_team_id === teamId).length;
    
    const blueWinRate = calculatePercentage(blueWins, blueMatchCount);
    const redWinRate = calculatePercentage(redWins, redMatchCount);
    
    console.log(`[teamsService] Win rates - Blue: ${blueWinRate}%, Red: ${redWinRate}%`);
    
    // Calculate first objectives
    const blueFirstBlood = calculatePercentage(
      blueMatches.filter(m => m.first_blood === teamId).length, 
      blueMatchCount
    );
    const redFirstBlood = calculatePercentage(
      redMatches.filter(m => m.first_blood === teamId).length, 
      redMatchCount
    );
    
    const blueFirstDragon = calculatePercentage(
      blueMatches.filter(m => m.first_dragon === teamId).length, 
      blueMatchCount
    );
    const redFirstDragon = calculatePercentage(
      redMatches.filter(m => m.first_dragon === teamId).length, 
      redMatchCount
    );
    
    const blueFirstHerald = calculatePercentage(
      blueMatches.filter(m => m.first_herald === teamId).length, 
      blueMatchCount
    );
    const redFirstHerald = calculatePercentage(
      redMatches.filter(m => m.first_herald === teamId).length, 
      redMatchCount
    );
    
    const blueFirstTower = calculatePercentage(
      blueMatches.filter(m => m.first_tower === teamId).length, 
      blueMatchCount
    );
    const redFirstTower = calculatePercentage(
      redMatches.filter(m => m.first_tower === teamId).length, 
      redMatchCount
    );
    
    console.log(`[teamsService] First objectives:`, {
      blueFirstBlood,
      redFirstBlood,
      blueFirstDragon,
      redFirstDragon,
      blueFirstHerald,
      redFirstHerald,
      blueFirstTower,
      redFirstTower
    });
    
    // Get player match stats for timeline data
    const { data: playerStatsData, error: statsError } = await supabase
      .from('player_match_stats')
      .select('*')
      .eq('team_id', teamId);
    
    console.log(`[teamsService] Player stats query result:`, { 
      error: statsError, 
      statsCount: playerStatsData?.length || 0
    });
    
    let timelineStats = null;
    
    if (!statsError && playerStatsData && playerStatsData.length > 0) {
      console.log(`[teamsService] Found ${playerStatsData.length} player stats for team ${teamId}`);
      timelineStats = calculateTimelineStats(playerStatsData);
      console.log(`[teamsService] Timeline stats calculated:`, timelineStats);
    } else {
      console.log(`[teamsService] No player stats found, using default timeline data`);
      // Use default timeline stats
      timelineStats = {
        '10': {
          avgGold: 3250,
          avgXp: 4120,
          avgCs: 85,
          avgGoldDiff: 350,
          avgKills: 1.2,
          avgDeaths: 0.8
        },
        '15': {
          avgGold: 5120,
          avgXp: 6780,
          avgCs: 130,
          avgGoldDiff: 580,
          avgKills: 2.5,
          avgDeaths: 1.3
        },
        '20': {
          avgGold: 7350,
          avgXp: 9450,
          avgCs: 175,
          avgGoldDiff: 850,
          avgKills: 3.8,
          avgDeaths: 2.1
        },
        '25': {
          avgGold: 9780,
          avgXp: 12400,
          avgCs: 220,
          avgGoldDiff: 1250,
          avgKills: 5.2,
          avgDeaths: 3.0
        }
      };
    }
    
    const statistics: SideStatistics = {
      blueWins: blueWinRate,
      redWins: redWinRate,
      blueFirstBlood,
      redFirstBlood,
      blueFirstDragon,
      redFirstDragon,
      blueFirstHerald,
      redFirstHerald,
      blueFirstTower,
      redFirstTower,
      timelineStats
    };
    
    console.log(`[teamsService] Returning side statistics for team ${teamId}:`, statistics);
    return statistics;
  } catch (error) {
    console.error(`[teamsService] Error getting side statistics:`, error);
    return getMockSideStatistics(teamId);
  }
};

// Helper function to calculate percentage
const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// Helper function to calculate timeline stats
const calculateTimelineStats = (playerStats: any[]) => {
  // Group stats by time points
  const timePoints = ['10', '15', '20', '25'];
  const result: any = {};
  
  timePoints.forEach(time => {
    const goldKey = `gold_at_${time}`;
    const xpKey = `xp_at_${time}`;
    const csKey = `cs_at_${time}`;
    const goldDiffKey = `gold_diff_at_${time}`;
    const killsKey = `kills_at_${time}`;
    const deathsKey = `deaths_at_${time}`;
    
    // Filter out null values and calculate averages
    const goldValues = playerStats.filter(s => s[goldKey] !== null).map(s => s[goldKey]);
    const xpValues = playerStats.filter(s => s[xpKey] !== null).map(s => s[xpKey]);
    const csValues = playerStats.filter(s => s[csKey] !== null).map(s => s[csKey]);
    const goldDiffValues = playerStats.filter(s => s[goldDiffKey] !== null).map(s => s[goldDiffKey]);
    const killsValues = playerStats.filter(s => s[killsKey] !== null).map(s => s[killsKey]);
    const deathsValues = playerStats.filter(s => s[deathsKey] !== null).map(s => s[deathsKey]);
    
    console.log(`[teamsService] Timeline ${time}min data points:`, {
      gold: goldValues.length,
      xp: xpValues.length,
      cs: csValues.length,
      goldDiff: goldDiffValues.length,
      kills: killsValues.length,
      deaths: deathsValues.length
    });
    
    const avgGold = calculateAverage(goldValues);
    const avgXp = calculateAverage(xpValues);
    const avgCs = calculateAverage(csValues);
    const avgGoldDiff = calculateAverage(goldDiffValues);
    const avgKills = calculateAverage(killsValues, 1);
    const avgDeaths = calculateAverage(deathsValues, 1);
    
    result[time] = {
      avgGold: Math.round(avgGold),
      avgXp: Math.round(avgXp),
      avgCs: Math.round(avgCs),
      avgGoldDiff: Math.round(avgGoldDiff),
      avgKills: Math.round(avgKills * 10) / 10, // One decimal place
      avgDeaths: Math.round(avgDeaths * 10) / 10 // One decimal place
    };
  });
  
  return result;
};

// Helper function to calculate average with fallback value
const calculateAverage = (values: number[], decimalPlaces = 0): number => {
  if (!values.length) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  const avg = sum / values.length;
  
  if (decimalPlaces > 0) {
    const multiplier = Math.pow(10, decimalPlaces);
    return Math.round(avg * multiplier) / multiplier;
  }
  
  return avg;
};
