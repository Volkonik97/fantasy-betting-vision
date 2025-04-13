
/**
 * Matches data retrieval functions
 * 
 * This file re-exports functions from the operations folder for backward compatibility
 */

// Export cache clear functions
export { clearMatchCache } from './cache/matchesCache';

// Export match fetch operations
export { getMatches } from './operations/getMatchesList';
export { getMatchById } from './operations/getMatchById';
export { getMatchesByTeamId } from './operations/getMatchesByTeamId';
