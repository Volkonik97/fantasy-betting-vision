
import { SideStatistics, TimelineStats } from '../models/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Get side statistics for a team with simplified types to avoid deep nesting
export const getSideStatistics = async (teamId: string): Promise<SideStatistics> => {
  try {
    console.log(`[sideStatistics] Fetching side statistics for team: ${teamId}`);

    if (!teamId) {
      console.warn("[sideStatistics] No team ID provided");
      return createDefaultSideStatistics(teamId);
    }

    // Query database for blue side matches
    const { data: blueMatches, error: blueError } = await supabase
      .from('matches')
      .select('*')
      .eq('team1_id', teamId);

    // Query database for red side matches
    const { data: redMatches, error: redError } = await supabase
      .from('matches')
      .select('*')
      .eq('team2_id', teamId);

    if (blueError) console.error('[sideStatistics] Error fetching blue side matches:', blueError);
    if (redError) console.error('[sideStatistics] Error fetching red side matches:', redError);

    const blueMatchesArray = blueMatches || [];
    const redMatchesArray = redMatches || [];
    const allMatches = [...blueMatchesArray, ...redMatchesArray];
    
    if (allMatches.length === 0) return createDefaultSideStatistics(teamId);

    // Fetch team stats
    const { data: teamMatchStats, error: statsError } = await supabase
      .from('team_match_stats')
      .select('*')
      .eq('team_id', teamId);

    // Fetch player stats for first blood
    const { data: playerMatchStats, error: playerError } = await supabase
      .from('player_match_stats')
      .select('match_id, team_id, side, firstbloodkill')
      .eq('team_id', teamId);

    if (statsError) console.error('[sideStatistics] Error fetching team match stats:', statsError);
    if (playerError) console.error('[sideStatistics] Error fetching player match stats:', playerError);

    // Calculate statistics
    const stats = calculateSideStatistics(
      teamId,
      allMatches,
      blueMatchesArray,
      redMatchesArray,
      teamMatchStats || [],
      playerMatchStats || []
    );

    return stats;
  } catch (error) {
    console.error('[sideStatistics] Error getting side statistics:', error);
    toast.error("Error loading team statistics");
    return createDefaultSideStatistics(teamId);
  }
};

// Safe calculation of statistics
function calculateSideStatistics(
  teamId: string,
  allMatches: any[],
  blueMatches: any[],
  redMatches: any[],
  teamMatchStats: any[],
  playerMatchStats: any[]
): SideStatistics {
  // Filter completed matches
  const completedBlueMatches = blueMatches.filter(m => m.status === 'Completed');
  const completedRedMatches = redMatches.filter(m => m.status === 'Completed');

  // Calculate win rates
  const blueWins = completedBlueMatches.filter(m => m.winner_team_id === teamId).length;
  const redWins = completedRedMatches.filter(m => m.winner_team_id === teamId).length;

  const blueWinRate = completedBlueMatches.length > 0
    ? Math.round((blueWins / completedBlueMatches.length) * 100)
    : 50;

  const redWinRate = completedRedMatches.length > 0
    ? Math.round((redWins / completedRedMatches.length) * 100)
    : 50;

  // Calculate first blood rates from player stats
  const blueSideGames = new Set<string>();
  const redSideGames = new Set<string>();
  const blueFBGames = new Set<string>();
  const redFBGames = new Set<string>();

  for (const stat of playerMatchStats || []) {
    if (!stat || !stat.match_id) continue;
    
    const matchId = stat.match_id;
    const isBlue = stat.side?.toLowerCase() === 'blue';

    if (isBlue) blueSideGames.add(matchId);
    else redSideGames.add(matchId);

    if (stat.firstbloodkill === true) {
      if (isBlue) blueFBGames.add(matchId);
      else redFBGames.add(matchId);
    }
  }

  const blueFirstBlood = blueSideGames.size > 0
    ? Math.round((blueFBGames.size / blueSideGames.size) * 100)
    : 0;

  const redFirstBlood = redSideGames.size > 0
    ? Math.round((redFBGames.size / redSideGames.size) * 100)
    : 0;

  // Filter team stats by side
  const blueTeamStats = teamMatchStats.filter(stat => stat && stat.side?.toLowerCase() === 'blue');
  const redTeamStats = teamMatchStats.filter(stat => stat && stat.side?.toLowerCase() === 'red');

  // Calculate objective rates
  const blueFirstDragon = calculateObjectiveRate(blueTeamStats, 'firstdragon', true);
  const redFirstDragon = calculateObjectiveRate(redTeamStats, 'firstdragon', true);

  const blueFirstHerald = calculateObjectiveRate(blueTeamStats, 'firstherald', true);
  const redFirstHerald = calculateObjectiveRate(redTeamStats, 'firstherald', true);

  const blueFirstTower = calculateObjectiveRate(blueTeamStats, 'firsttower', true);
  const redFirstTower = calculateObjectiveRate(redTeamStats, 'firsttower', true);

  const blueFirstBaron = calculateObjectiveRate(blueTeamStats, 'firstbaron', true);
  const redFirstBaron = calculateObjectiveRate(redTeamStats, 'firstbaron', true);

  // Return complete statistics
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
    timelineStats: createDefaultTimelineStats(),
  };
}

// Helper function to calculate objective rates
function calculateObjectiveRate(stats: any[], objectiveKey: string, logDetails: boolean = false): number {
  if (!stats || stats.length === 0) return 50;

  // Apply null/undefined safety
  const validStats = stats.filter(stat => stat !== null && stat !== undefined);
  if (validStats.length === 0) return 50;

  const objectiveCount = validStats.filter(stat => stat[objectiveKey] === true).length;
  const totalMatches = validStats.length;
  const percentage = Math.round((objectiveCount / totalMatches) * 100);

  if (logDetails) {
    console.log(`[sideStatistics] ${objectiveKey} detail - Total matches: ${totalMatches}, Objectives obtained: ${objectiveCount}, Percentage: ${percentage}%`);
  }

  return percentage;
}

// Create default statistics when data is unavailable
function createDefaultSideStatistics(teamId: string): SideStatistics {
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
      avgGold: 3250, avgXp: 4120, avgCs: 85,
      avgGoldDiff: 350, avgCsDiff: 5,
      avgKills: 1.2, avgDeaths: 0.8, avgAssists: 1.5
    },
    '15': {
      avgGold: 5120, avgXp: 6780, avgCs: 130,
      avgGoldDiff: 580, avgCsDiff: 8,
      avgKills: 2.5, avgDeaths: 1.3, avgAssists: 2.8
    },
    '20': {
      avgGold: 7350, avgXp: 9450, avgCs: 175,
      avgGoldDiff: 850, avgCsDiff: 12,
      avgKills: 3.8, avgDeaths: 2.1, avgAssists: 4.2
    },
    '25': {
      avgGold: 9780, avgXp: 12400, avgCs: 220,
      avgGoldDiff: 1250, avgCsDiff: 15,
      avgKills: 5.2, avgDeaths: 3, avgAssists: 5.7
    }
  };
}
