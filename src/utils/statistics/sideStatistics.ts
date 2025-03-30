
import { SideStatistics, TimelineStats } from '../models/types';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Get side statistics for a team
export const getSideStatistics = async (teamId: string): Promise<SideStatistics> => {
  try {
    console.log(`[sideStatistics] Fetching side statistics for team: ${teamId}`);
    
    // Query the database for matches involving this team
    const { data: blueMatches, error: blueError } = await supabase
      .from('matches')
      .select('*')
      .eq('team_blue_id', teamId);
      
    const { data: redMatches, error: redError } = await supabase
      .from('matches')
      .select('*')
      .eq('team_red_id', teamId);
    
    if (blueError) console.error("[sideStatistics] Error fetching blue side matches:", blueError);
    if (redError) console.error("[sideStatistics] Error fetching red side matches:", redError);
    
    const allMatches = [...(blueMatches || []), ...(redMatches || [])];
    console.log(`[sideStatistics] Found ${allMatches.length} matches for team ${teamId}`);
    
    if (allMatches.length === 0) {
      console.warn(`[sideStatistics] No matches found for team ${teamId}, using default statistics`);
      // Return default statistics if no matches found
      return createDefaultSideStatistics(teamId);
    }
    
    // Fetch first objectives data from team_match_stats for more accurate results
    const { data: teamMatchStats, error: statsError } = await supabase
      .from('team_match_stats')
      .select('*')
      .eq('team_id', teamId);
    
    if (statsError) {
      console.error("[sideStatistics] Error fetching team match stats:", statsError);
    }
    
    // Calculate statistics based on matches and team match stats
    const stats = calculateSideStatistics(
      teamId, 
      allMatches, 
      blueMatches || [], 
      redMatches || [],
      teamMatchStats || []
    );
    
    console.log("[sideStatistics] Calculated side statistics:", stats);
    return stats;
    
  } catch (error) {
    console.error("[sideStatistics] Error getting side statistics:", error);
    toast.error("Erreur lors du chargement des statistiques d'équipe");
    
    // Return default statistics in case of error
    return createDefaultSideStatistics(teamId);
  }
};

// Calculate side statistics from match data
function calculateSideStatistics(
  teamId: string,
  allMatches: any[],
  blueMatches: any[],
  redMatches: any[],
  teamMatchStats: any[]
): SideStatistics {
  // Filter for completed matches only
  const completedBlueMatches = blueMatches.filter(m => m.status === 'Completed');
  const completedRedMatches = redMatches.filter(m => m.status === 'Completed');
  
  console.log(`[sideStatistics] Found ${completedBlueMatches.length} completed blue matches and ${completedRedMatches.length} completed red matches`);
  
  // Calculate win rates
  const blueWins = completedBlueMatches.filter(m => m.winner_team_id === teamId).length;
  const redWins = completedRedMatches.filter(m => m.winner_team_id === teamId).length;
  
  const blueWinRate = completedBlueMatches.length > 0 
    ? Math.round((blueWins / completedBlueMatches.length) * 100) 
    : 50;
    
  const redWinRate = completedRedMatches.length > 0 
    ? Math.round((redWins / completedRedMatches.length) * 100) 
    : 50;
  
  console.log(`[sideStatistics] Win rates - Blue: ${blueWinRate}%, Red: ${redWinRate}%`);
  
  // Get blue-side and red-side team stats
  const blueTeamStats = teamMatchStats.filter(stat => stat.is_blue_side === true);
  const redTeamStats = teamMatchStats.filter(stat => stat.is_blue_side === false);
  
  console.log(`[sideStatistics] Team stats - Blue: ${blueTeamStats.length}, Red: ${redTeamStats.length}`);
  
  // Calculate objective rates from team_match_stats (more accurate)
  const blueFirstBlood = calculateObjectivePercentage(blueTeamStats, 'first_blood');
  const redFirstBlood = calculateObjectivePercentage(redTeamStats, 'first_blood');
  
  const blueFirstDragon = calculateObjectivePercentage(blueTeamStats, 'first_dragon');
  const redFirstDragon = calculateObjectivePercentage(redTeamStats, 'first_dragon');
  
  const blueFirstHerald = calculateObjectivePercentage(blueTeamStats, 'first_herald');
  const redFirstHerald = calculateObjectivePercentage(redTeamStats, 'first_herald');
  
  const blueFirstTower = calculateObjectivePercentage(blueTeamStats, 'first_tower');
  const redFirstTower = calculateObjectivePercentage(redTeamStats, 'first_tower');
  
  const blueFirstBaron = calculateObjectivePercentage(blueTeamStats, 'first_baron');
  const redFirstBaron = calculateObjectivePercentage(redTeamStats, 'first_baron');
  
  // Log the calculated stats for debugging
  console.log(`[sideStatistics] First objectives:`, {
    blueFirstBlood,
    redFirstBlood,
    blueFirstDragon,
    redFirstDragon,
    blueFirstHerald,
    redFirstHerald,
    blueFirstTower,
    redFirstTower,
    blueFirstBaron,
    redFirstBaron
  });
  
  // Return the calculated statistics
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
    blueFirstBaron,
    redFirstBaron,
    timelineStats: createDefaultTimelineStats()
  };
}

// Helper function to calculate objective rates using team_match_stats
function calculateObjectivePercentage(stats: any[], objectiveKey: string): number {
  if (stats.length === 0) return 50;
  
  const trueCount = stats.filter(stat => stat[objectiveKey] === true).length;
  return Math.round((trueCount / stats.length) * 100);
}

// Create default side statistics
function createDefaultSideStatistics(teamId: string): SideStatistics {
  console.log(`[sideStatistics] Creating default side statistics for team ${teamId}`);
  return {
    teamId,
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
    blueFirstBaron: 50,
    redFirstBaron: 50,
    timelineStats: createDefaultTimelineStats()
  };
}

// Create default timeline statistics
function createDefaultTimelineStats(): TimelineStats {
  return {
    '10': {
      avgGold: 3250,
      avgXp: 4120,
      avgCs: 85,
      avgGoldDiff: 350,
      avgCsDiff: 5,
      avgKills: 1.2,
      avgDeaths: 0.8,
      avgAssists: 1.5
    },
    '15': {
      avgGold: 5120,
      avgXp: 6780,
      avgCs: 130,
      avgGoldDiff: 580,
      avgCsDiff: 8,
      avgKills: 2.5,
      avgDeaths: 1.3,
      avgAssists: 2.8
    },
    '20': {
      avgGold: 7350,
      avgXp: 9450,
      avgCs: 175,
      avgGoldDiff: 850,
      avgCsDiff: 12,
      avgKills: 3.8,
      avgDeaths: 2.1,
      avgAssists: 4.2
    },
    '25': {
      avgGold: 9780,
      avgXp: 12400,
      avgCs: 220,
      avgGoldDiff: 1250,
      avgCsDiff: 15,
      avgKills: 5.2,
      avgDeaths: 3,
      avgAssists: 5.7
    }
  };
}
