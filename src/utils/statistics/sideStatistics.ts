
import { SideStatistics } from '../models/types';
import { calculatePercentage } from './helpers';
import { calculateTimelineStats } from './timelineStats';
import { getMockSideStatistics } from './mockStats';
import { supabase } from '@/integrations/supabase/client';

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
