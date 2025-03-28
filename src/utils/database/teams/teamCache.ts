
// Team cache management functionality
import { Team } from '../../models/types';

// Cache for teams data
let teamsCache: Team[] | null = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
let lastCacheUpdate = 0;

/**
 * Check if cache is valid
 */
export const isCacheValid = (): boolean => {
  const now = Date.now();
  return teamsCache !== null && (now - lastCacheUpdate) < CACHE_DURATION;
};

/**
 * Get teams from cache
 */
export const getTeamsFromCache = (): Team[] | null => {
  if (isCacheValid()) {
    console.log("Using cached teams data");
    return teamsCache;
  }
  return null;
};

/**
 * Update cache with new teams data
 */
export const updateTeamsCache = (teams: Team[]): void => {
  teamsCache = teams;
  lastCacheUpdate = Date.now();
  console.log(`Updated teams cache with ${teams.length} teams`);
};

/**
 * Find team in cache by ID
 */
export const findTeamInCache = (teamId: string): Team | null => {
  if (!teamsCache) return null;
  return teamsCache.find(t => t.id === teamId) || null;
};

/**
 * Update or add team to cache
 */
export const updateTeamInCache = (team: Team): void => {
  if (!teamsCache) {
    teamsCache = [team];
    lastCacheUpdate = Date.now();
    return;
  }
  
  const index = teamsCache.findIndex(t => t.id === team.id);
  if (index >= 0) {
    // Make sure to preserve the team name when updating
    const teamName = teamsCache[index].name;
    teamsCache[index] = {
      ...team,
      name: teamName || team.name
    };
  } else {
    teamsCache.push(team);
  }
  lastCacheUpdate = Date.now();
};

/**
 * Clear the teams cache
 */
export const clearTeamsCache = (): void => {
  console.log("Clearing teams cache");
  teamsCache = null;
  lastCacheUpdate = 0;
};

/**
 * Get team name from cache by ID
 */
export const getTeamNameFromCache = (teamId: string): string | null => {
  if (!teamsCache) return null;
  const team = teamsCache.find(t => t.id === teamId);
  return team ? team.name : null;
};

/**
 * Update all players in cache with their team name
 */
export const updatePlayersWithTeamName = (teamId: string, teamName: string): void => {
  if (!teamsCache) return;
  
  const team = teamsCache.find(t => t.id === teamId);
  if (team && team.players) {
    team.players = team.players.map(player => ({
      ...player,
      teamName: teamName
    }));
  }
};
