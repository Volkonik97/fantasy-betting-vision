
// Export all match-related functions
import { getMatches, getMatchById, clearMatchCache } from './getMatches';
import { saveMatches } from './saveMatches';
import { getPlayerMatchStats, getPlayerStats, getTeamTimelineStats, getPlayerTimelineStats, clearPlayerStatsCache } from './playerStats';
import { savePlayerMatchStats } from './savePlayerMatchStats';

export {
  getMatches,
  getMatchById,
  saveMatches,
  getPlayerMatchStats,
  getPlayerStats,
  getTeamTimelineStats,
  getPlayerTimelineStats,
  clearPlayerStatsCache,
  clearMatchCache,
  savePlayerMatchStats
};
