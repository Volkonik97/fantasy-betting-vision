
import { SideStatistics } from '../models/types';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Get side statistics for a team
export const getSideStatistics = async (teamId: string): Promise<SideStatistics> => {
  try {
    console.log(`Fetching side statistics for team: ${teamId}`);
    
    // Query the database for matches involving this team
    const { data: blueMatches, error: blueError } = await supabase
      .from('matches')
      .select('*')
      .eq('team_blue_id', teamId);
      
    const { data: redMatches, error: redError } = await supabase
      .from('matches')
      .select('*')
      .eq('team_red_id', teamId);
    
    if (blueError) console.error("Error fetching blue side matches:", blueError);
    if (redError) console.error("Error fetching red side matches:", redError);
    
    const allMatches = [...(blueMatches || []), ...(redMatches || [])];
    console.log(`Found ${allMatches.length} matches for team ${teamId}`);
    
    if (allMatches.length === 0) {
      console.warn(`No matches found for team ${teamId}, using default statistics`);
      // Return default statistics if no matches found
      return createDefaultSideStatistics(teamId);
    }
    
    // Calculate statistics based on matches
    const stats = calculateSideStatistics(teamId, allMatches, blueMatches || [], redMatches || []);
    return stats;
    
  } catch (error) {
    console.error("Error getting side statistics:", error);
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
  
  // Calculate win rates
  const blueWins = completedBlueMatches.filter(m => m.winner_team_id === teamId).length;
  const redWins = completedRedMatches.filter(m => m.winner_team_id === teamId).length;
  
  const blueWinRate = completedBlueMatches.length > 0 
    ? (blueWins / completedBlueMatches.length) * 100 
    : 50;
    
  const redWinRate = completedRedMatches.length > 0 
    ? (redWins / completedRedMatches.length) * 100 
    : 50;
  
  // Calculate first objectives (simplified)
  const blueFirstBlood = completedBlueMatches.filter(m => m.first_blood === teamId).length;
  const redFirstBlood = completedRedMatches.filter(m => m.first_blood === teamId).length;
  
  const blueFirstBloodRate = completedBlueMatches.length > 0 
    ? (blueFirstBlood / completedBlueMatches.length) * 100 
    : 50;
    
  const redFirstBloodRate = completedRedMatches.length > 0 
    ? (redFirstBlood / completedRedMatches.length) * 100 
    : 50;
  
  // Return the calculated statistics
  return {
    teamId,
    blueWins: Math.round(blueWinRate),
    redWins: Math.round(redWinRate),
    blueFirstBlood: Math.round(blueFirstBloodRate),
    redFirstBlood: Math.round(redFirstBloodRate),
    blueFirstDragon: 50, // Default values for now
    redFirstDragon: 50,
    blueFirstHerald: 50,
    redFirstHerald: 50,
    blueFirstTower: 50,
    redFirstTower: 50,
    timelineStats: createDefaultTimelineStats()
  };
}

// Create default side statistics
function createDefaultSideStatistics(teamId: string): SideStatistics {
  console.log(`Creating default side statistics for team ${teamId}`);
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
      avgDeaths: 3
    }
  };
}
