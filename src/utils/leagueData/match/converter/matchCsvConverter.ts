
import { GameTracker } from '../../types';
import { MatchCSV } from '../../../csv/types';
import { determineMatchStatus } from './statusDeterminer';
import { extractTeamStatistics } from './teamStatsExtractor';
import { extractMatchResultData } from './matchResultExtractor';
import { extractObjectiveStats } from './objectiveStatsExtractor';
import { debugMatchData } from './debugHelper';

/**
 * Convert a game tracker to a CSV row for matches
 */
export function convertToMatchCsv(game: GameTracker, matchStats: Map<string, Map<string, any>>): MatchCSV {
  // Determine match status (Upcoming, Live, Completed)
  const status = determineMatchStatus(game);
  
  // Extract team statistics from match stats
  const { teamBlueStats, teamRedStats } = extractTeamStatistics(game, matchStats);
  
  // Extract basic match data
  const matchCsv: MatchCSV = {
    id: game.id,
    tournament: game.league || '',
    date: game.date || '',
    teamBlueId: game.teams.blue,
    teamRedId: game.teams.red,
    predictedWinner: '',  // No predicted winner from Oracle's Elixir data
    blueWinOdds: '',  // No win odds from Oracle's Elixir data
    redWinOdds: '',  // No win odds from Oracle's Elixir data
    status,
    teamStats: !!teamBlueStats || !!teamRedStats,
  };

  // Extract objective statistics if available
  if (teamBlueStats || teamRedStats) {
    const objectiveStats = extractObjectiveStats(teamBlueStats, teamRedStats, game.id);
    Object.assign(matchCsv, objectiveStats);
  }
  
  // Extract match result data if the match is completed
  if (status === 'Completed' && game.result) {
    const resultData = extractMatchResultData(game);
    Object.assign(matchCsv, resultData);
  }
  
  // Debug specific matches if needed
  debugMatchData(game.id, matchCsv);
  
  return matchCsv;
}
