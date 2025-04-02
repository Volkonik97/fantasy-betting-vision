
import { Team, Player } from '../../models/types';

// Cache for teams data
let teamsCache: Team[] | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes 
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
  console.log("Teams cache invalidated due to age");
  return null;
};

/**
 * Update cache with new teams data
 */
export const updateTeamsCache = (teams: Team[]): void => {
  teamsCache = teams;
  lastCacheUpdate = Date.now();
  console.log(`Updated teams cache with ${teams.length} teams`);
  
  // Log some basic cache statistics for debugging
  if (teams.length > 0) {
    const playersCount = teams.reduce((count, team) => count + (team.players?.length || 0), 0);
    console.log(`Total players in cache: ${playersCount}`);
    
    // Log teams by region
    const regionCounts = teams.reduce((acc, team) => {
      const region = team.region || 'Unknown';
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log("Teams by region in cache:", regionCounts);
    
    // Check for LCK teams specifically
    const lckTeams = teams.filter(team => team.region === 'LCK');
    console.log(`LCK teams in cache: ${lckTeams.length}`);
    lckTeams.forEach(team => {
      console.log(`LCK team ${team.name} has ${team.players?.length || 0} players in cache`);
    });
  }
};

/**
 * Find team in cache by ID
 */
export const findTeamInCache = (teamId: string): Team | null => {
  if (!teamsCache || !isCacheValid()) return null;
  const team = teamsCache.find(t => t.id === teamId);
  if (team) {
    console.log(`Found team ${team.name} in cache with ${team.players?.length || 0} players`);
  } else {
    console.log(`Team ${teamId} not found in cache`);
  }
  return team || null;
};

/**
 * Update or add team to cache
 */
export const updateTeamInCache = (team: Team): void => {
  if (!teamsCache || !isCacheValid()) {
    teamsCache = [team];
    lastCacheUpdate = Date.now();
    console.log(`Created new teams cache with team ${team.name}`);
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
    console.log(`Updated team ${teamName} in cache`);
  } else {
    teamsCache.push(team);
    console.log(`Added new team ${team.name} to cache`);
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
  if (!teamsCache || !isCacheValid()) return null;
  const team = teamsCache.find(t => t.id === teamId);
  return team ? team.name : null;
};

/**
 * Update all players in cache with their team name
 */
export const updatePlayersWithTeamName = (teamId: string, teamName: string, teamRegion?: string): void => {
  if (!teamsCache || !isCacheValid()) return;
  
  const team = teamsCache.find(t => t.id === teamId);
  if (team && team.players) {
    console.log(`Updating ${team.players.length} players with team name ${teamName} and region ${teamRegion || team.region}`);
    team.players = team.players.map(player => ({
      ...player,
      teamName: teamName,
      teamRegion: teamRegion || team.region || player.teamRegion
    }));
  } else {
    console.log(`Team ${teamId} not found in cache or has no players`);
  }
};
