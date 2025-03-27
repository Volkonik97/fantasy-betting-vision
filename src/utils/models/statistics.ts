
import { SideStatistics } from './types';
import { teams } from './mockTeams';
import { populateTeamPlayers } from './mockPlayers';
import { supabase } from '@/integrations/supabase/client';

// Make sure teams have their players
const populatedTeams = populateTeamPlayers();

// Default side statistics if data is not available
const defaultSideStats: SideStatistics = {
  blueWins: 50,
  redWins: 50,
  blueFirstBlood: 50,
  redFirstBlood: 50,
  blueFirstDragon: 50,
  redFirstDragon: 50,
  blueFirstHerald: 50,
  redFirstHerald: 50,
  blueFirstTower: 50,
  redFirstTower: 50,
  timelineStats: {
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
  }
};

// Get side statistics with async handling
export const getSideStatistics = async (teamId: string): Promise<SideStatistics> => {
  console.log(`Getting side statistics for team ${teamId}`);
  
  try {
    // Get matches for this team
    const { data: matchesData, error: matchesError } = await supabase
      .from('matches')
      .select('*')
      .or(`team_blue_id.eq.${teamId},team_red_id.eq.${teamId}`)
      .limit(20);
    
    if (matchesError) {
      console.error("Error fetching matches for side statistics:", matchesError);
      return getMockSideStatistics(teamId);
    }
    
    if (!matchesData || matchesData.length === 0) {
      console.log(`No matches found for team ${teamId}, using mock data`);
      return getMockSideStatistics(teamId);
    }
    
    console.log(`Found ${matchesData.length} matches for team ${teamId}`);
    
    // Extract match IDs
    const matchIds = matchesData.map(match => match.id);
    
    // Get player stats for these matches
    const { data: playerStatsData, error: statsError } = await supabase
      .from('player_match_stats')
      .select('*')
      .eq('team_id', teamId)
      .in('match_id', matchIds);
    
    if (statsError) {
      console.error("Error fetching player stats for side statistics:", statsError);
      return getMockSideStatistics(teamId);
    }
    
    if (!playerStatsData || playerStatsData.length === 0) {
      console.log(`No player stats found for team ${teamId}, using mock data`);
      return getMockSideStatistics(teamId);
    }
    
    console.log(`Found ${playerStatsData.length} player stats entries for team ${teamId}`);
    
    // Calculate basics stats
    const blueMatches = matchesData.filter(m => m.team_blue_id === teamId);
    const redMatches = matchesData.filter(m => m.team_red_id === teamId);
    
    const blueMatchCount = blueMatches.length;
    const redMatchCount = redMatches.length;
    
    // Calculate win rates
    const blueWins = blueMatches.filter(m => m.winner_team_id === teamId).length;
    const redWins = redMatches.filter(m => m.winner_team_id === teamId).length;
    
    const blueWinRate = calculatePercentage(blueWins, blueMatchCount);
    const redWinRate = calculatePercentage(redWins, redMatchCount);
    
    // Calculate first objective stats
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
    
    // Calculate timeline stats from player data
    const timelineStats = calculateTimelineStats(playerStatsData);
    
    console.log(`Team ${teamId} calculated stats:`, {
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
      hasTimelineStats: !!timelineStats
    });
    
    return {
      teamId,
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
  } catch (error) {
    console.error("Error getting side statistics:", error);
    return getMockSideStatistics(teamId);
  }
};

// Helper function to calculate percentage
const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// Helper function to calculate average
const calculateAverage = (values: number[], decimalPlaces = 0): number => {
  if (!values || values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  const avg = sum / values.length;
  
  if (decimalPlaces > 0) {
    const multiplier = Math.pow(10, decimalPlaces);
    return Math.round(avg * multiplier) / multiplier;
  }
  
  return avg;
};

// Calculate timeline stats from player data
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
    
    console.log(`Timeline ${time}min data points:`, {
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

// Fallback to mock data if database fails
const getMockSideStatistics = (teamId: string): SideStatistics => {
  console.log(`Getting mock side statistics for team ${teamId}`);
  
  const team = populatedTeams.find(t => t.id === teamId);
  if (!team) {
    // Return default stats if team not found
    console.log(`Team ${teamId} not found in mock data, using default stats`);
    return {
      ...defaultSideStats,
      teamId
    };
  }
  
  // Generate more realistic mock data based on team win rates
  return {
    teamId,
    blueWins: Math.round(team.blueWinRate * 100),
    redWins: Math.round(team.redWinRate * 100),
    blueFirstBlood: 62,
    redFirstBlood: 58,
    blueFirstDragon: 71,
    redFirstDragon: 65,
    blueFirstHerald: 68,
    redFirstHerald: 59,
    blueFirstTower: 65,
    redFirstTower: 62,
    timelineStats: defaultSideStats.timelineStats
  };
};
