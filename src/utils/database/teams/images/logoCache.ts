
import { toast } from "sonner";

// Structure pour stocker les URLs de logos d'équipe en mémoire
interface LogoCache {
  [teamId: string]: string | null;
}

// Cache global pour les logos d'équipe - simplifié
const globalLogoCache: LogoCache = {};

/**
 * Ajoute ou met à jour un logo dans le cache
 */
export const cacheTeamLogo = (teamId: string, url: string | null): void => {
  if (!teamId) return;
  globalLogoCache[teamId] = url;
};

/**
 * Récupère un logo depuis le cache s'il existe
 */
export const getTeamLogoFromCache = (teamId: string): string | null | undefined => {
  if (!teamId) return undefined;
  return globalLogoCache[teamId];
};

/**
 * Gère les erreurs de chargement de logos - simplifié
 */
export const handleLogoError = (teamId: string, teamName?: string): boolean => {
  if (!teamId) return false;
  // Marquer comme non disponible dans le cache
  globalLogoCache[teamId] = null;
  return false; // Ne pas essayer à nouveau
};

/**
 * Efface le cache des logos
 */
export const clearLogoCache = (): void => {
  Object.keys(globalLogoCache).forEach(key => delete globalLogoCache[key]);
};

/**
 * Précharge les logos d'équipe pour une liste donnée - simplifié
 */
export const preloadTeamLogos = async (
  teamIds: string[], 
  getLogoFunction: (teamId: string) => Promise<string | null>
): Promise<void> => {
  if (!teamIds || teamIds.length === 0) return;
  
  // Ne précharger que quelques logos à la fois pour ne pas surcharger
  for (const teamId of teamIds.slice(0, 5)) {
    try {
      if (!teamId) continue;
      const url = await getLogoFunction(teamId);
      cacheTeamLogo(teamId, url);
    } catch (error) {
      console.error(`Error preloading logo for team ${teamId}:`, error);
      if (teamId) {
        cacheTeamLogo(teamId, null);
      }
    }
  }
};
