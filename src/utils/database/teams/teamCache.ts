
import { Team } from "../../models/types";

let teamsCache: Team[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Vérifie si le cache d'équipes est valide (non null et pas expiré)
 */
export const isTeamsCacheValid = (): boolean => {
  return (
    teamsCache !== null &&
    Date.now() - cacheTimestamp < CACHE_DURATION
  );
};

/**
 * Récupère les équipes depuis le cache
 */
export const getTeamsFromCache = (): Team[] | null => {
  return teamsCache;
};

/**
 * Récupère le nom d'une équipe à partir de son ID en utilisant le cache
 */
export const getTeamNameFromCache = (teamId: string): string => {
  if (!teamId || !teamsCache) return "Équipe inconnue";
  
  const team = teamsCache.find(t => t.id === teamId);
  return team ? team.name : "Équipe inconnue";
};

/**
 * Met à jour le cache d'équipes
 */
export const setTeamsCache = (teams: Team[] | null): void => {
  teamsCache = teams;
  cacheTimestamp = Date.now();
};

/**
 * Met à jour une équipe dans le cache
 */
export const updateTeamInCache = (updatedTeam: Team): void => {
  if (!teamsCache) return;
  
  const index = teamsCache.findIndex(team => team.id === updatedTeam.id);
  if (index !== -1) {
    teamsCache[index] = updatedTeam;
  }
};

/**
 * Vide le cache d'équipes
 */
export const clearTeamsCache = (): void => {
  teamsCache = null;
  cacheTimestamp = 0;
};
