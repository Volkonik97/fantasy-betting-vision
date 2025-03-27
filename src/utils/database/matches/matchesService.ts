
// Export all match-related functions
import { getMatches, getMatchById, clearMatchCache } from './getMatches';
import { saveMatches } from './saveMatches';
import { getPlayerMatchStats, getTeamTimelineStats, clearPlayerStatsCache } from './playerStats';

export {
  getMatches,
  getMatchById,
  saveMatches,
  getPlayerMatchStats,
  getTeamTimelineStats,
  clearPlayerStatsCache,
  clearMatchCache
};
