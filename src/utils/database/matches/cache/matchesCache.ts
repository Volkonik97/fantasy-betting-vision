
/**
 * Cache system for matches
 */

import { Match } from "@/utils/models/types";

// Cache storage
let matchesCache: Record<string, Match[]> = {};
let matchesByTeamCache: Record<string, Match[]> = {};
let cacheTimeStamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Clears the matches cache
 */
export const clearMatchCache = (): void => {
  matchesCache = {};
  matchesByTeamCache = {};
  cacheTimeStamp = 0;
};

/**
 * Checks if a cache entry is valid
 */
export const isCacheValid = (): boolean => {
  return Date.now() - cacheTimeStamp < CACHE_DURATION;
};

/**
 * Get matches from cache
 */
export const getMatchesFromCache = (cacheKey: string): Match[] | null => {
  if (matchesCache[cacheKey] && isCacheValid()) {
    return matchesCache[cacheKey];
  }
  return null;
};

/**
 * Get team matches from cache
 */
export const getTeamMatchesFromCache = (teamId: string): Match[] | null => {
  if (matchesByTeamCache[teamId] && isCacheValid()) {
    return matchesByTeamCache[teamId];
  }
  return null;
};

/**
 * Store matches in cache
 */
export const storeMatchesInCache = (cacheKey: string, matches: Match[]): void => {
  matchesCache[cacheKey] = matches;
  cacheTimeStamp = Date.now();
};

/**
 * Store team matches in cache
 */
export const storeTeamMatchesInCache = (teamId: string, matches: Match[]): void => {
  matchesByTeamCache[teamId] = matches;
  cacheTimeStamp = Date.now();
};

/**
 * Look for a match by ID in the cache
 */
export const findMatchInCache = (matchId: string): Match | null => {
  if (!isCacheValid()) {
    return null;
  }

  // Check all cache entries
  for (const cacheKey of Object.keys(matchesCache)) {
    const matchList = matchesCache[cacheKey] || [];
    for (const match of matchList) {
      if (match.id === matchId) {
        return match;
      }
    }
  }

  return null;
};
