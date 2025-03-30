
import { GameTracker } from '../../types';
import { MatchCSV } from '../../../csv/types';
import { determineMatchStatus } from './statusDeterminer';
import { extractTeamStatistics } from './teamStatsExtractor';
import { extractMatchResultData } from './matchResultExtractor';
import { extractObjectiveStats } from './objectiveStatsExtractor';
import { debugMatchData } from './debugHelper';
import { extractPicksAndBans } from '../picksAndBansExtractor';

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
  
  // Extract picks and bans data if available
  if (game.rows && game.rows.size > 0) {
    // Pass the rows Set directly to extractPicksAndBans which now handles both arrays and Sets
    const { picks, bans } = extractPicksAndBans(game.rows);
    
    if (picks) {
      matchCsv.picks = picks;
      console.log(`[matchCsvConverter] Match ${game.id} - Picks data found:`, Object.keys(picks).length);
    }
    
    if (bans) {
      matchCsv.bans = bans;
      console.log(`[matchCsvConverter] Match ${game.id} - Bans data found:`, Object.keys(bans).length);
    }
  }
  
  // Debug specific matches if needed
  debugMatchData(game.id, matchCsv);
  
  return matchCsv;
}
