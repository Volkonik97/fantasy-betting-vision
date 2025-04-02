
import { Team, Player, Match, Tournament } from '../../models/types';

// Create a module-level cache with getter and setter functions
let _loadedTeams: Team[] | null = null;
let _loadedPlayers: Player[] | null = null;
let _loadedMatches: Match[] | null = null;
let _loadedTournaments: Tournament[] | null = null;
let _lastCacheUpdate = Date.now();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Getter functions with cache invalidation
export const getLoadedTeams = (): Team[] | null => {
  if (Date.now() - _lastCacheUpdate > CACHE_DURATION) {
    console.log("Cache expired, returning null");
    return null;
  }
  return _loadedTeams;
};

export const getLoadedPlayers = (): Player[] | null => {
  if (Date.now() - _lastCacheUpdate > CACHE_DURATION) {
    console.log("Cache expired, returning null");
    return null;
  }
  return _loadedPlayers;
};

export const getLoadedMatches = (): Match[] | null => {
  if (Date.now() - _lastCacheUpdate > CACHE_DURATION) {
    console.log("Cache expired, returning null");
    return null;
  }
  return _loadedMatches;
};

export const getLoadedTournaments = (): Tournament[] | null => {
  if (Date.now() - _lastCacheUpdate > CACHE_DURATION) {
    console.log("Cache expired, returning null");
    return null;
  }
  return _loadedTournaments;
};

// Setter functions that update the cache timestamp
export const setLoadedTeams = (teams: Team[] | null): void => {
  _loadedTeams = teams;
  if (teams) _lastCacheUpdate = Date.now();
  console.log(`Teams cache ${teams ? 'updated' : 'cleared'}`);
};

export const setLoadedPlayers = (players: Player[] | null): void => {
  _loadedPlayers = players;
  if (players) _lastCacheUpdate = Date.now();
  console.log(`Players cache ${players ? 'updated with ' + players.length + ' players' : 'cleared'}`);
};

export const setLoadedMatches = (matches: Match[] | null): void => {
  _loadedMatches = matches;
  if (matches) _lastCacheUpdate = Date.now();
  console.log(`Matches cache ${matches ? 'updated' : 'cleared'}`);
};

export const setLoadedTournaments = (tournaments: Tournament[] | null): void => {
  _loadedTournaments = tournaments;
  if (tournaments) _lastCacheUpdate = Date.now();
  console.log(`Tournaments cache ${tournaments ? 'updated' : 'cleared'}`);
};

// Function to reset the cache
export const resetCache = (): void => {
  _loadedTeams = null;
  _loadedPlayers = null;
  _loadedMatches = null;
  _loadedTournaments = null;
  console.log("All cache data reset");
};

// Function to check if cache is valid
export const isCacheValid = (): boolean => {
  return Date.now() - _lastCacheUpdate <= CACHE_DURATION;
};
