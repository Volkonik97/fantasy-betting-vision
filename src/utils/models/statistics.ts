
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
  // Try to get stats from the database first
  try {
    const { data: matchesData, error: matchesError } = await supabase
      .from('matches')
      .select('*')
      .or(`team_blue_id.eq.${teamId},team_red_id.eq.${teamId}`)
      .limit(10);
    
    if (matchesError) {
      console.error("Error fetching matches for side statistics:", matchesError);
      // Fall back to mock data
      return getMockSideStatistics(teamId);
    }
    
    // If we have matches data, fetch player stats for these matches
    if (matchesData && matchesData.length > 0) {
      // Extract match IDs
      const matchIds = matchesData.map(match => match.id);
      
      const { data: playerStatsData, error: statsError } = await supabase
        .from('player_match_stats')
        .select('*')
        .in('match_id', matchIds)
        .eq('team_id', teamId);
      
      if (statsError) {
        console.error("Error fetching player stats for side statistics:", statsError);
        // Fall back to mock data
        return getMockSideStatistics(teamId);
      }
      
      if (playerStatsData && playerStatsData.length > 0) {
        // Calculate average statistics
        const timelineStats = calculateTimelineStats(playerStatsData);
        
        // Get basic stats from the matches
        const blueMatches = matchesData.filter(m => m.team_blue_id === teamId);
        const redMatches = matchesData.filter(m => m.team_red_id === teamId);
        
        const blueWins = blueMatches.filter(m => m.winner_team_id === teamId).length;
        const redWins = redMatches.filter(m => m.winner_team_id === teamId).length;

        const blueWinRate = blueMatches.length ? (blueWins / blueMatches.length) * 100 : 0;
        const redWinRate = redMatches.length ? (redWins / redMatches.length) * 100 : 0;
        
        const firstBloodBlue = blueMatches.filter(m => m.first_blood === teamId).length;
        const firstBloodRed = redMatches.filter(m => m.first_blood === teamId).length;
        
        const firstDragonBlue = blueMatches.filter(m => m.first_dragon === teamId).length;
        const firstDragonRed = redMatches.filter(m => m.first_dragon === teamId).length;
        
        const firstHeraldBlue = blueMatches.filter(m => m.first_herald === teamId).length;
        const firstHeraldRed = redMatches.filter(m => m.first_herald === teamId).length;
        
        const firstTowerBlue = blueMatches.filter(m => m.first_tower === teamId).length;
        const firstTowerRed = redMatches.filter(m => m.first_tower === teamId).length;
        
        return {
          blueWins: Math.round(blueWinRate),
          redWins: Math.round(redWinRate),
          blueFirstBlood: Math.round((firstBloodBlue / blueMatches.length) * 100) || 0,
          redFirstBlood: Math.round((firstBloodRed / redMatches.length) * 100) || 0,
          blueFirstDragon: Math.round((firstDragonBlue / blueMatches.length) * 100) || 0,
          redFirstDragon: Math.round((firstDragonRed / redMatches.length) * 100) || 0,
          blueFirstHerald: Math.round((firstHeraldBlue / blueMatches.length) * 100) || 0,
          redFirstHerald: Math.round((firstHeraldRed / redMatches.length) * 100) || 0,
          blueFirstTower: Math.round((firstTowerBlue / blueMatches.length) * 100) || 0,
          redFirstTower: Math.round((firstTowerRed / redMatches.length) * 100) || 0,
          // Include timeline stats
          timelineStats
        };
      }
    }
    
    // If no database data or processing failed, fall back to mock data
    return getMockSideStatistics(teamId);
  } catch (error) {
    console.error("Error getting side statistics:", error);
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
    
    const avgGold = goldValues.length ? goldValues.reduce((sum, val) => sum + val, 0) / goldValues.length : 0;
    const avgXp = xpValues.length ? xpValues.reduce((sum, val) => sum + val, 0) / xpValues.length : 0;
    const avgCs = csValues.length ? csValues.reduce((sum, val) => sum + val, 0) / csValues.length : 0;
    const avgGoldDiff = goldDiffValues.length ? goldDiffValues.reduce((sum, val) => sum + val, 0) / goldDiffValues.length : 0;
    const avgKills = killsValues.length ? killsValues.reduce((sum, val) => sum + val, 0) / killsValues.length : 0;
    const avgDeaths = deathsValues.length ? deathsValues.reduce((sum, val) => sum + val, 0) / deathsValues.length : 0;
    
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
  const team = populatedTeams.find(t => t.id === teamId);
  if (!team) {
    // Return default stats if team not found
    return {
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
  }
  
  return {
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
    // Add mock timeline stats
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
};
