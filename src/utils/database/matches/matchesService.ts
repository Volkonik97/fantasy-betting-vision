// Re-export from the matches directory
export { 
  getMatches, 
  getMatchById, 
  clearMatchCache, 
  getMatchesByTeamId 
} from './getMatches';

// Re-export other functions
import { saveMatches } from './saveMatches';
import { 
  getPlayerMatchStats, 
  getPlayerStats, 
  getTeamTimelineStats, 
  getPlayerTimelineStats, 
  clearPlayerStatsCache 
} from './playerStats';
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
import { extractTeamSpecificStats } from './teamStatsExtractor';
import { saveTeamMatchStats } from './saveTeamStats';
import { getTeamMatchStats, getAllTeamMatchStats, getMatchTeamStats } from './getTeamStats';

export {
  // Already re-exported at the top:
  // getMatches, getMatchById, clearMatchCache, getMatchesByTeamId

  // Other exports:
  saveMatches,
  getPlayerMatchStats,
  getPlayerStats,
  getTeamTimelineStats,
  getPlayerTimelineStats,
  clearPlayerStatsCache,
  savePlayerMatchStats,
  extractTeamSpecificStats,
  saveTeamMatchStats,
  getTeamMatchStats,
  getAllTeamMatchStats,
  getMatchTeamStats,
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
