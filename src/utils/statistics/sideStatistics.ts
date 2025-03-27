
import { SideStatistics } from '../models/types';
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
    
    // Calculate statistics based on matches
    const stats = calculateSideStatistics(teamId, allMatches, blueMatches || [], redMatches || []);
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
  redMatches: any[]
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
  
  // Calculate first objectives stats
  const blueFirstBlood = calculateObjectiveRate(completedBlueMatches, 'first_blood', teamId);
  const redFirstBlood = calculateObjectiveRate(completedRedMatches, 'first_blood', teamId);
  
  const blueFirstDragon = calculateObjectiveRate(completedBlueMatches, 'first_dragon', teamId);
  const redFirstDragon = calculateObjectiveRate(completedRedMatches, 'first_dragon', teamId);
  
  const blueFirstHerald = calculateObjectiveRate(completedBlueMatches, 'first_herald', teamId);
  const redFirstHerald = calculateObjectiveRate(completedRedMatches, 'first_herald', teamId);
  
  const blueFirstTower = calculateObjectiveRate(completedBlueMatches, 'first_tower', teamId);
  const redFirstTower = calculateObjectiveRate(completedRedMatches, 'first_tower', teamId);
  
  console.log(`[sideStatistics] First objectives:`, {
    blueFirstBlood,
    redFirstBlood,
    blueFirstDragon,
    redFirstDragon,
    blueFirstHerald,
    redFirstHerald,
    blueFirstTower,
    redFirstTower
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
    timelineStats: createDefaultTimelineStats()
  };
}

// Helper function to calculate objective rates
function calculateObjectiveRate(matches: any[], objectiveKey: string, teamId: string): number {
  if (matches.length === 0) return 50;
  
  const objectiveCount = matches.filter(m => m[objectiveKey] === teamId).length;
  return Math.round((objectiveCount / matches.length) * 100);
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
    timelineStats: createDefaultTimelineStats()
  };
}

// Create default timeline statistics
function createDefaultTimelineStats() {
  return {
    '10': {
      avgGold: 3250,
      avgXp: 4120,
      avgCs: 85,
      avgGoldDiff: 350,
      avgKills: 1.2,
      avgDeaths: 0.8,
      avgAssists: 1.5
    },
    '15': {
      avgGold: 5120,
      avgXp: 6780,
      avgCs: 130,
      avgGoldDiff: 580,
      avgKills: 2.5,
      avgDeaths: 1.3,
      avgAssists: 2.8
    },
    '20': {
      avgGold: 7350,
      avgXp: 9450,
      avgCs: 175,
      avgGoldDiff: 850,
      avgKills: 3.8,
      avgDeaths: 2.1,
      avgAssists: 4.2
    },
    '25': {
      avgGold: 9780,
      avgXp: 12400,
      avgCs: 220,
      avgGoldDiff: 1250,
      avgKills: 5.2,
      avgDeaths: 3,
      avgAssists: 5.7
    }
  };
}
