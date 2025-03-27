
// Export all models and mock data from a single file
export * from './types';
export * from './mockTeams';
export * from './mockPlayers';
export * from './mockMatches';
export * from './mockTournaments';
// Import from the new statistics module instead of the old file
export { getSideStatistics, getMockSideStatistics } from '../statistics';
