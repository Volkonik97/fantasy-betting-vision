
import { Team, Player, Match, Tournament } from '../../models/types';

// Create a module-level cache with getter and setter functions
let _loadedTeams: Team[] | null = null;
let _loadedPlayers: Player[] | null = null;
let _loadedMatches: Match[] | null = null;
let _loadedTournaments: Tournament[] | null = null;
let _lastCacheUpdate = 0; // Initialize with expired cache

// Getter functions that immediately return null (no caching)
export const getLoadedTeams = (): Team[] | null => {
  return null; // Always return null to force fresh data loading
};

export const getLoadedPlayers = (): Player[] | null => {
  return null; // Always return null to force fresh data loading
};

export const getLoadedMatches = (): Match[] | null => {
  return null; // Always return null to force fresh data loading
};

export const getLoadedTournaments = (): Tournament[] | null => {
  return null; // Always return null to force fresh data loading
};

// Setter functions that log but don't store data
export const setLoadedTeams = (teams: Team[] | null): void => {
  console.log(`Teams cache disabled, received ${teams?.length || 0} teams`);
};

export const setLoadedPlayers = (players: Player[] | null): void => {
  console.log(`Players cache disabled, received ${players?.length || 0} players`);
};

export const setLoadedMatches = (matches: Match[] | null): void => {
  console.log(`Matches cache disabled, received ${matches?.length || 0} matches`);
};

export const setLoadedTournaments = (tournaments: Tournament[] | null): void => {
  console.log(`Tournaments cache disabled, received ${tournaments?.length || 0} tournaments`);
};

// Function to reset the cache - no-op since cache is disabled
export const resetCache = (): void => {
  console.log("Cache is already disabled");
};

// Function to check if cache is valid - always returns false
export const isCacheValid = (): boolean => {
  return false; // Cache is never valid, always fetch fresh data
};
