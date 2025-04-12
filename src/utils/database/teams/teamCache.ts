
/**
 * Système de cache pour les équipes
 * Réduit les appels à la base de données et améliore les performances
 */

import { Team } from "../../models/types";

// Cache des équipes
let teamsCache: Team[] | null = null;
let teamCacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes en millisecondes

/**
 * Vérifie si le cache des équipes est valide
 */
export const isTeamsCacheValid = (): boolean => {
  if (!teamsCache) return false;
  
  const now = Date.now();
  return now - teamCacheTimestamp < CACHE_DURATION;
};

/**
 * Définit le cache des équipes
 */
export const setTeamsCache = (teams: Team[]): void => {
  teamsCache = [...teams];
  teamCacheTimestamp = Date.now();
  console.log(`🧠 Cache des équipes mis à jour avec ${teams.length} équipes`);
};

/**
 * Récupère les équipes depuis le cache
 */
export const getTeamsFromCache = (): Team[] | null => {
  if (!isTeamsCacheValid()) {
    return null;
  }
  
  console.log(`🧠 Utilisation du cache d'équipes (${teamsCache?.length || 0} équipes)`);
  return teamsCache ? [...teamsCache] : null;
};

/**
 * Vide le cache des équipes
 */
export const clearTeamsCache = (): void => {
  teamsCache = null;
  teamCacheTimestamp = 0;
  console.log("🧹 Cache des équipes vidé");
};

/**
 * Met à jour une équipe spécifique dans le cache
 */
export const updateTeamInCache = (updatedTeam: Team): void => {
  if (!teamsCache) return;
  
  const index = teamsCache.findIndex(team => team.id === updatedTeam.id);
  if (index !== -1) {
    teamsCache[index] = updatedTeam;
    teamCacheTimestamp = Date.now();
    console.log(`🧠 Équipe ${updatedTeam.name} (${updatedTeam.id}) mise à jour dans le cache`);
  }
};

/**
 * Ajoute une équipe au cache
 */
export const addTeamToCache = (newTeam: Team): void => {
  if (!teamsCache) {
    teamsCache = [newTeam];
  } else {
    teamsCache.push(newTeam);
  }
  teamCacheTimestamp = Date.now();
  console.log(`🧠 Équipe ${newTeam.name} (${newTeam.id}) ajoutée au cache`);
};
