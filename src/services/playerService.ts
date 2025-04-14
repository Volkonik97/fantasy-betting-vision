
import { Player } from '@/utils/models/types';
import { getPlayers, getPlayerById } from '@/utils/database/playersService';

/**
 * Get all players with optional pagination
 */
export const getAllPlayers = async (page?: number, pageSize?: number): Promise<Player[]> => {
  try {
    // If page and pageSize are undefined, get all players with no pagination
    return await getPlayers(page, pageSize);
  } catch (error) {
    console.error("Error in getAllPlayers:", error);
    return [];
  }
};

/**
 * Get player by ID
 */
export const getPlayerByID = async (id: string): Promise<Player | null> => {
  try {
    return await getPlayerById(id);
  } catch (error) {
    console.error(`Error in getPlayerByID(${id}):`, error);
    return null;
  }
};

/**
 * Get player search results - effectue une recherche côté client
 * pour permettre une recherche instantanée sans requêtes supplémentaires
 */
export const searchPlayers = async <T extends Player>(
  players: T[], 
  query: string
): Promise<T[]> => {
  try {
    if (!query || query.trim() === "") return players;

    const lowercaseQuery = query.toLowerCase();
    return players.filter(player => 
      player.name.toLowerCase().includes(lowercaseQuery)
    );
  } catch (error) {
    console.error("Error in searchPlayers:", error);
    return [];
  }
};

/**
 * Filtre les joueurs par rôle, région et catégorie
 */
export const filterPlayers = (
  players: Player[] | (Player & { teamName: string; teamRegion: string })[],
  role: string = 'All',
  region: string = 'All',
  subRegion: string = 'All',
  category: string = 'All',
  regionCategories: Record<string, string[]>
): Player[] | (Player & { teamName: string; teamRegion: string })[] => {
  return players.filter(player => {
    // Filtre par rôle
    const roleMatch = role === 'All' || player.role === role;
    
    // Filtre par région
    const regionMatch = region === 'All' || player.teamRegion === region;
    
    // Filtre par sous-région
    const subRegionMatch = subRegion === 'All' || player.teamRegion === subRegion;
    
    // Filtre par catégorie (vérifier si la région du joueur est dans la catégorie sélectionnée)
    const categoryMatch = category === 'All' || 
      (regionCategories[category] && regionCategories[category].includes(player.teamRegion || ''));

    // Application conditionnelle des filtres en fonction des sélections
    if (region !== 'All') {
      // Si une région spécifique est sélectionnée, utiliser la région plutôt que la catégorie
      return roleMatch && regionMatch;
    } else if (category !== 'All') {
      // Si une catégorie est sélectionnée, l'utiliser pour filtrer
      return roleMatch && categoryMatch;
    } else if (subRegion !== 'All') {
      // Si une sous-région est sélectionnée, l'utiliser pour filtrer
      return roleMatch && subRegionMatch;
    } else {
      // Par défaut, juste filtrer par rôle
      return roleMatch;
    }
  });
};
