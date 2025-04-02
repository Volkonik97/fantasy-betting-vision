
import { Team, Player } from '../../models/types';
import { normalizeRoleName } from "../../leagueData/assembler/modelConverter";

// Cache pour les données des équipes
let teamsCache: Team[] | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let lastCacheUpdate = 0;

/**
 * Vérifie si le cache est valide
 */
export const isCacheValid = (): boolean => {
  const now = Date.now();
  return teamsCache !== null && (now - lastCacheUpdate) < CACHE_DURATION;
};

/**
 * Récupère les équipes du cache
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
 * Met à jour le cache avec de nouvelles données d'équipe
 */
export const updateTeamsCache = (teams: Team[]): void => {
  if (!teams || !Array.isArray(teams)) {
    console.error("Invalid teams data provided to cache update:", teams);
    return;
  }

  // Deep clone to avoid reference issues
  const clonedTeams = JSON.parse(JSON.stringify(teams));
  
  // Ensure each player has proper normalized role and team information
  clonedTeams.forEach((team: Team) => {
    if (team.players && Array.isArray(team.players)) {
      team.players = team.players.map(player => ({
        ...player,
        role: normalizeRoleName(player.role),
        teamName: player.teamName || team.name || "",
        teamRegion: player.teamRegion || team.region || ""
      }));
    }
  });
  
  teamsCache = clonedTeams;
  lastCacheUpdate = Date.now();
  console.log(`Updated teams cache with ${teams.length} teams at ${new Date().toLocaleTimeString()}`);
  
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
 * Trouve une équipe dans le cache par ID
 */
export const findTeamInCache = (teamId: string): Team | null => {
  if (!teamsCache || !isCacheValid() || !teamId) return null;
  
  const team = teamsCache.find(t => t.id === teamId);
  if (team) {
    console.log(`Found team ${team.name} in cache with ${team.players?.length || 0} players`);
  } else {
    console.log(`Team ${teamId} not found in cache`);
  }
  return team ? JSON.parse(JSON.stringify(team)) : null; // Return deep clone
};

/**
 * Met à jour ou ajoute une équipe dans le cache
 */
export const updateTeamInCache = (team: Team): void => {
  if (!team || !team.id) {
    console.error("Invalid team provided to cache update:", team);
    return;
  }

  if (!teamsCache || !isCacheValid()) {
    teamsCache = [JSON.parse(JSON.stringify(team))]; // Deep clone
    lastCacheUpdate = Date.now();
    console.log(`Created new teams cache with team ${team.name} at ${new Date().toLocaleTimeString()}`);
    return;
  }
  
  // Deep clone the current cache to avoid reference issues
  const updatedCache = JSON.parse(JSON.stringify(teamsCache));
  
  const index = updatedCache.findIndex((t: Team) => t.id === team.id);
  if (index >= 0) {
    // Clone the team to update
    const updatedTeam = JSON.parse(JSON.stringify(team));
    
    // Make sure to preserve the team name when updating
    const teamName = updatedCache[index].name;
    updatedCache[index] = {
      ...updatedTeam,
      name: teamName || updatedTeam.name
    };
    
    // Ensure all players have proper team information
    if (updatedCache[index].players && Array.isArray(updatedCache[index].players)) {
      updatedCache[index].players = updatedCache[index].players.map((player: Player) => ({
        ...player,
        role: normalizeRoleName(player.role),
        teamName: player.teamName || teamName || updatedTeam.name || "",
        teamRegion: player.teamRegion || updatedTeam.region || ""
      }));
    }
    
    console.log(`Updated team ${teamName} in cache with ${updatedCache[index].players?.length || 0} players`);
  } else {
    // Clone the new team
    const newTeam = JSON.parse(JSON.stringify(team));
    
    // Ensure all players have proper team information
    if (newTeam.players && Array.isArray(newTeam.players)) {
      newTeam.players = newTeam.players.map((player: Player) => ({
        ...player,
        role: normalizeRoleName(player.role),
        teamName: player.teamName || newTeam.name || "",
        teamRegion: player.teamRegion || newTeam.region || ""
      }));
    }
    
    updatedCache.push(newTeam);
    console.log(`Added new team ${team.name} to cache with ${newTeam.players?.length || 0} players`);
  }
  
  teamsCache = updatedCache;
  lastCacheUpdate = Date.now();
};

/**
 * Supprime le cache des équipes
 */
export const clearTeamsCache = (): void => {
  console.log(`Clearing teams cache at ${new Date().toLocaleTimeString()}`);
  teamsCache = null;
  lastCacheUpdate = 0;
};

/**
 * Récupère le nom d'une équipe depuis le cache par ID
 */
export const getTeamNameFromCache = (teamId: string): string | null => {
  if (!teamsCache || !isCacheValid() || !teamId) return null;
  const team = teamsCache.find(t => t.id === teamId);
  return team ? team.name : null;
};

/**
 * Met à jour tous les joueurs du cache avec le nom de leur équipe
 */
export const updatePlayersWithTeamName = (teamId: string, teamName: string, teamRegion?: string): void => {
  if (!teamsCache || !isCacheValid() || !teamId || !teamName) return;
  
  const updatedCache = JSON.parse(JSON.stringify(teamsCache)); // Deep clone
  const teamIndex = updatedCache.findIndex((t: Team) => t.id === teamId);
  
  if (teamIndex >= 0 && updatedCache[teamIndex].players) {
    console.log(`Updating ${updatedCache[teamIndex].players.length} players with team name ${teamName} and region ${teamRegion || updatedCache[teamIndex].region}`);
    
    updatedCache[teamIndex].players = updatedCache[teamIndex].players.map((player: Player) => ({
      ...player,
      role: normalizeRoleName(player.role),
      teamName: teamName,
      teamRegion: teamRegion || updatedCache[teamIndex].region || player.teamRegion || ""
    }));
    
    teamsCache = updatedCache;
    lastCacheUpdate = Date.now();
    console.log(`Successfully updated players for team ${teamName} in cache`);
  } else {
    console.log(`Team ${teamId} not found in cache or has no players`);
  }
};

// Fonction pour rafraîchir le cache après une période d'inactivité
export const refreshCacheIfNeeded = (teams: Team[]): void => {
  const now = Date.now();
  const cacheAge = now - lastCacheUpdate;
  
  if (!teamsCache || cacheAge > CACHE_DURATION / 2) { // Refresh at 50% of cache lifetime
    console.log(`Refreshing teams cache (age: ${cacheAge}ms)`);
    updateTeamsCache(teams);
  }
};
