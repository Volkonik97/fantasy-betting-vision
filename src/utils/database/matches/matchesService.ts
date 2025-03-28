
// Re-export from the matches directory
import { getMatches, getMatchById, clearMatchCache, getMatchesByTeamId } from './getMatches';
import { saveMatches } from './saveMatches';
import { getPlayerMatchStats, getPlayerStats, getTeamTimelineStats, getPlayerTimelineStats, clearPlayerStatsCache } from './playerStats';
import { savePlayerMatchStats } from './savePlayerMatchStats';
import { 
  isSeriesMatch, 
  getSeriesScore, 
  getGameNumberFromId, 
  getBaseMatchId, 
  getSeriesScoreUpToGame, 
  isStandardSeries,
  isStandardSeriesLength,
  determineSeriesLength,
  fetchSeriesMatches,
  calculateSeriesScore
} from './series';

export {
  getMatches,
  getMatchById,
  getMatchesByTeamId,
  saveMatches,
  getPlayerMatchStats,
  getPlayerStats,
  getTeamTimelineStats,
  getPlayerTimelineStats,
  clearPlayerStatsCache,
  clearMatchCache,
  savePlayerMatchStats,
  // Series-related exports
  isSeriesMatch,
  getSeriesScore,
  getGameNumberFromId,
  getBaseMatchId,
  getSeriesScoreUpToGame,
  isStandardSeries,
  isStandardSeriesLength,
  determineSeriesLength,
  fetchSeriesMatches,
  calculateSeriesScore
};
