
// Export all match-related functions
import { getMatches, getMatchById, clearMatchCache } from './getMatches';
import { saveMatches } from './saveMatches';
import { getPlayerMatchStats, getPlayerStats, getTeamTimelineStats, clearPlayerStatsCache } from './playerStats';
import { savePlayerMatchStats } from './savePlayerMatchStats';

export {
  getMatches,
  getMatchById,
  saveMatches,
  getPlayerMatchStats,
  getPlayerStats,
  getTeamTimelineStats,
  clearPlayerStatsCache,
  clearMatchCache,
  savePlayerMatchStats
};
