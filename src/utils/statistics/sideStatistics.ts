import { SideStatistics, TimelineStats } from '../models/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

    if (blueError) console.error('[sideStatistics] Error fetching blue side matches:', blueError);
    if (redError) console.error('[sideStatistics] Error fetching red side matches:', redError);

    const allMatches = [...(blueMatches || []), ...(redMatches || [])];
    if (allMatches.length === 0) return createDefaultSideStatistics(teamId);

    const { data: teamMatchStats, error: statsError } = await supabase
      .from('team_match_stats')
      .select('*')
      .eq('team_id', teamId);

    const { data: playerMatchStats, error: playerError } = await supabase
      .from('player_match_stats')
      .select('match_id, team_id, is_blue_side, first_blood_kill')
      .eq('team_id', teamId);

    if (statsError) console.error('[sideStatistics] Error fetching team match stats:', statsError);
    if (playerError) console.error('[sideStatistics] Error fetching player match stats:', playerError);

    const stats = calculateSideStatistics(
      teamId,
      allMatches,
      blueMatches || [],
      redMatches || [],
      teamMatchStats || [],
      playerMatchStats || []
    );

    return stats;
  } catch (error) {
    console.error('[sideStatistics] Error getting side statistics:', error);
    toast.error("Erreur lors du chargement des statistiques d'équipe");
    return createDefaultSideStatistics(teamId);
  }
};

function calculateSideStatistics(
  teamId: string,
  allMatches: any[],
  blueMatches: any[],
  redMatches: any[],
  teamMatchStats: any[],
  playerMatchStats: any[]
): SideStatistics {
  const completedBlueMatches = blueMatches.filter(m => m.status === 'Completed');
  const completedRedMatches = redMatches.filter(m => m.status === 'Completed');

  const blueWins = completedBlueMatches.filter(m => m.winner_team_id === teamId).length;
  const redWins = completedRedMatches.filter(m => m.winner_team_id === teamId).length;

  const blueWinRate = completedBlueMatches.length > 0
    ? Math.round((blueWins / completedBlueMatches.length) * 100)
    : 50;

  const redWinRate = completedRedMatches.length > 0
    ? Math.round((redWins / completedRedMatches.length) * 100)
    : 50;

  // First Blood calculation from player stats
  const blueSideGames = new Set<string>();
  const redSideGames = new Set<string>();
  const blueFBGames = new Set<string>();
  const redFBGames = new Set<string>();

  for (const stat of playerMatchStats || []) {
    const matchId = stat.match_id;
    const isBlue = stat.is_blue_side;

    if (isBlue) blueSideGames.add(matchId);
    else redSideGames.add(matchId);

    if (stat.first_blood_kill === true) {
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

  const blueTeamStats = teamMatchStats.filter(stat => stat.is_blue_side === true);
  const redTeamStats = teamMatchStats.filter(stat => stat.is_blue_side === false);

  const blueFirstDragon = calculateObjectiveCountPercentage(blueTeamStats, 'first_dragon', true);
  const redFirstDragon = calculateObjectiveCountPercentage(redTeamStats, 'first_dragon', true);

  const blueFirstHerald = calculateObjectiveCountPercentage(blueTeamStats, 'first_herald', true);
  const redFirstHerald = calculateObjectiveCountPercentage(redTeamStats, 'first_herald', true);

  const blueFirstTower = calculateObjectiveCountPercentage(blueTeamStats, 'first_tower', true);
  const redFirstTower = calculateObjectiveCountPercentage(redTeamStats, 'first_tower', true);

  const blueFirstBaron = calculateObjectiveCountPercentage(blueTeamStats, 'first_baron', true);
  const redFirstBaron = calculateObjectiveCountPercentage(redTeamStats, 'first_baron', true);

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

function calculateObjectiveCountPercentage(stats: any[], objectiveKey: string, logDetails: boolean = false): number {
  if (stats.length === 0) return 50;

  const objectiveCount = stats.filter(stat => stat[objectiveKey] === true).length;
  const totalMatches = stats.length;
  const percentage = Math.round((objectiveCount / totalMatches) * 100);

  if (logDetails) {
    console.log(`[sideStatistics] ${objectiveKey} detail - Total matches: ${totalMatches}, Objectives obtained: ${objectiveCount}, Percentage: ${percentage}%`);
  }

  return percentage;
}

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