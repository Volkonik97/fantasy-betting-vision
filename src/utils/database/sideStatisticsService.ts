import { supabase } from "@/integrations/supabase/client";
import { SideStatistics } from '../models/types';
import { getMockSideStatistics } from '../statistics';
import { calculateAverage, calculatePercentage } from '../statistics/helpers';

// Get side statistics for a team
export const getSideStatistics = async (teamId: string): Promise<SideStatistics> => {
  console.log(`[sideStatisticsService] Fetching side statistics for team: ${teamId}`);
  try {
    // Check if team exists in database
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();
    
    if (teamError || !teamData) {
      console.log(`[sideStatisticsService] Team ${teamId} not found in database, using mock data`);
      return getMockSideStatistics(teamId);
    }
    
    // Get matches for this team
    const { data: matchesData, error: matchesError } = await supabase
      .from('matches')
      .select('*')
      .or(`team_blue_id.eq.${teamId},team_red_id.eq.${teamId}`);
    
    console.log(`[sideStatisticsService] Matches query result:`, { 
      error: matchesError, 
      matchCount: matchesData?.length || 0
    });
    
    if (matchesError || !matchesData || matchesData.length === 0) {
      console.log(`[sideStatisticsService] No matches found for team ${teamId}, using mock data`);
      return getMockSideStatistics(teamId);
    }
    
    console.log(`[sideStatisticsService] Found ${matchesData.length} matches for team ${teamId}`);
    
    // Calculate statistics based on matches
    const blueMatches = matchesData.filter(m => 
      (m.team_blue_id === teamId || m.team1_id === teamId));
    const redMatches = matchesData.filter(m => 
      (m.team_red_id === teamId || m.team2_id === teamId));
    
    const blueMatchCount = blueMatches.length;
    const redMatchCount = redMatches.length;
    
    console.log(`[sideStatisticsService] Blue matches: ${blueMatchCount}, Red matches: ${redMatchCount}`);
    
    // Calculate win rates
    const blueWins = blueMatches.filter(m => m.winner_team_id === teamId).length;
    const redWins = redMatches.filter(m => m.winner_team_id === teamId).length;
    
    const blueWinRate = calculatePercentage(blueWins, blueMatchCount);
    const redWinRate = calculatePercentage(redWins, redMatchCount);
    
    console.log(`[sideStatisticsService] Win rates - Blue: ${blueWinRate}%, Red: ${redWinRate}%`);
    
    // Calculate first objectives
    const blueFirstBlood = calculatePercentage(
      blueMatches.filter(m => m.firstblood_team_id === teamId).length, 
      blueMatchCount
    );
    const redFirstBlood = calculatePercentage(
      redMatches.filter(m => m.firstblood_team_id === teamId).length, 
      redMatchCount
    );
    
    const blueFirstDragon = calculatePercentage(
      blueMatches.filter(m => m.firstdragon_team_id === teamId).length, 
      blueMatchCount
    );
    const redFirstDragon = calculatePercentage(
      redMatches.filter(m => m.firstdragon_team_id === teamId).length, 
      redMatchCount
    );
    
    const blueFirstHerald = calculatePercentage(
      blueMatches.filter(m => 
        (m.first_herald === teamId || m.firstherald_team_id === teamId)
      ).length, 
      blueMatchCount
    );
    const redFirstHerald = calculatePercentage(
      redMatches.filter(m => 
        (m.first_herald === teamId || m.firstherald_team_id === teamId)
      ).length, 
      redMatchCount
    );
    
    const blueFirstTower = calculatePercentage(
      blueMatches.filter(m => m.firsttower_team_id === teamId).length, 
      blueMatchCount
    );
    const redFirstTower = calculatePercentage(
      redMatches.filter(m => m.firsttower_team_id === teamId).length, 
      redMatchCount
    );
    
    console.log(`[sideStatisticsService] First objectives:`, {
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
    
    console.log(`[sideStatisticsService] Player stats query result:`, { 
      error: statsError, 
      statsCount: playerStatsData?.length || 0
    });
    
    let timelineStats = null;
    
    if (!statsError && playerStatsData && playerStatsData.length > 0) {
      console.log(`[sideStatisticsService] Found ${playerStatsData.length} player stats for team ${teamId}`);
      timelineStats = calculateTimelineStats(playerStatsData);
      console.log(`[sideStatisticsService] Timeline stats calculated:`, timelineStats);
    } else {
      console.log(`[sideStatisticsService] No player stats found, using default timeline data`);
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
    
    console.log(`[sideStatisticsService] Returning side statistics for team ${teamId}:`, statistics);
    return statistics;
  } catch (error) {
    console.error(`[sideStatisticsService] Error getting side statistics:`, error);
    return getMockSideStatistics(teamId);
  }
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
    
    console.log(`[sideStatisticsService] Timeline ${time}min data points:`, {
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
