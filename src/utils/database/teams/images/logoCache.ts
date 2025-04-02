
import { toast } from "sonner";

// Structure pour stocker les URLs de logos d'équipe en mémoire
interface LogoCache {
  [teamId: string]: {
    url: string | null;
    timestamp: number;
    attempts: number;
  }
}

// Cache global pour les logos d'équipe
const globalLogoCache: LogoCache = {};

// Durée de vie du cache en millisecondes (24 heures)
const CACHE_LIFETIME = 24 * 60 * 60 * 1000;

// Nombre maximum de tentatives de rechargement pour un logo
const MAX_RELOAD_ATTEMPTS = 2;

/**
 * Ajoute ou met à jour un logo dans le cache
 */
export const cacheTeamLogo = (teamId: string, url: string | null): void => {
  if (!teamId) return;
  
  globalLogoCache[teamId] = {
    url,
    timestamp: Date.now(),
    attempts: 0
  };
};

/**
 * Récupère un logo depuis le cache s'il existe et n'est pas expiré
 */
export const getTeamLogoFromCache = (teamId: string): string | null | undefined => {
  if (!teamId || !globalLogoCache[teamId]) return undefined;
  
  const cacheEntry = globalLogoCache[teamId];
  
  // Si le cache est périmé, on le considère comme invalide
  if (Date.now() - cacheEntry.timestamp > CACHE_LIFETIME) {
    console.log(`Logo cache expired for team ${teamId}`);
    return undefined;
  }
  
  return cacheEntry.url;
};

/**
 * Gère les erreurs de chargement de logos
 * @returns true si une autre tentative doit être faite, false sinon
 */
export const handleLogoError = (teamId: string, teamName?: string): boolean => {
  if (!teamId || !globalLogoCache[teamId]) return false;
  
  const cacheEntry = globalLogoCache[teamId];
  
  // Incrémenter le nombre de tentatives
  cacheEntry.attempts += 1;
  
  // Si on a atteint le nombre maximum de tentatives
  if (cacheEntry.attempts >= MAX_RELOAD_ATTEMPTS) {
    console.log(`Maximum logo loading attempts reached for team ${teamId} (${teamName || 'unknown'})`);
    // Marquer comme définitivement non disponible
    cacheEntry.url = null;
    return false;
  }
  
  console.log(`Retrying logo load for team ${teamId} (${teamName || 'unknown'}), attempt ${cacheEntry.attempts}`);
  return true;
};

/**
 * Efface le cache des logos
 */
export const clearLogoCache = (): void => {
  Object.keys(globalLogoCache).forEach(key => delete globalLogoCache[key]);
  toast.success("Cache des logos effacé");
  console.log("Logo cache cleared");
};

/**
 * Précharge les logos d'équipe pour une liste donnée
 */
export const preloadTeamLogos = async (
  teamIds: string[], 
  getLogoFunction: (teamId: string) => Promise<string | null>
): Promise<void> => {
  // Filtrer les IDs qui ne sont pas déjà dans le cache
  const uncachedIds = teamIds.filter(id => getTeamLogoFromCache(id) === undefined);
  
  if (uncachedIds.length === 0) return;
  
  console.log(`Preloading ${uncachedIds.length} team logos`);
  
  // Précharger les logos par lots de 5 pour ne pas surcharger
  const batchSize = 5;
  for (let i = 0; i < uncachedIds.length; i += batchSize) {
    const batch = uncachedIds.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (teamId) => {
      try {
        const url = await getLogoFunction(teamId);
        cacheTeamLogo(teamId, url);
      } catch (error) {
        console.error(`Error preloading logo for team ${teamId}:`, error);
        cacheTeamLogo(teamId, null);
      }
    }));
    
    // Petite pause entre les lots
    if (i + batchSize < uncachedIds.length) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
};
