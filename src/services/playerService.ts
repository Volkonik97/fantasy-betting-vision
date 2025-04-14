import { Player } from '@/utils/models/types';
import { getPlayers, getPlayerById } from '@/utils/database/playersService';
import { getPlayersCount } from '@/utils/database/players/playersService';

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
 * Load all players by making multiple paginated requests
 * This is necessary when we need to load more than 1000 players
 */
export const loadAllPlayersInBatches = async (): Promise<Player[]> => {
  try {
    const batchSize = 1000; // Supabase's max limit
    let allPlayers: Player[] = [];
    let currentPage = 1;
    let hasMoreData = true;
    
    console.log("Loading all players in batches...");
    
    while (hasMoreData) {
      const batch = await getPlayers(currentPage, batchSize);
      console.log(`Loaded batch ${currentPage} with ${batch.length} players`);
      
      if (batch.length === 0) {
        hasMoreData = false;
      } else {
        allPlayers = [...allPlayers, ...batch];
        currentPage++;
      }
      
      // Safety check to prevent infinite loops
      if (currentPage > 10) {
        console.warn("Reached maximum number of batches (10), stopping the loading process");
        hasMoreData = false;
      }
    }
    
    console.log(`Successfully loaded ${allPlayers.length} players in total`);
    return allPlayers;
  } catch (error) {
    console.error("Error loading all players in batches:", error);
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
 * Maps normalized role names (UI display names) to database role values
 */
const roleMapping: Record<string, string[]> = {
  'All': ['top', 'jng', 'mid', 'bot', 'sup'], // All roles
  'Top': ['top'],
  'Jungle': ['jng'],
  'Mid': ['mid'],
  'ADC': ['bot', 'adc'], // Match both "bot" and "adc" values
  'Support': ['sup', 'support'] // Match both "sup" and "support" values
};

/**
 * Filtre les joueurs par rôle, région et catégorie
 * Version améliorée avec meilleure gestion du filtrage par rôle
 */
export const filterPlayers = (
  players: Player[] | (Player & { teamName: string; teamRegion: string })[],
  role: string = 'All',
  region: string = 'All',
  subRegion: string = 'All',
  category: string = 'All',
  regionCategories: Record<string, string[]>
): Player[] | (Player & { teamName: string; teamRegion: string })[] => {
  console.log(`Filtering players - Role: ${role}, Region: ${region}, SubRegion: ${subRegion}, Category: ${category}`);
  console.log(`Total players before filtering: ${players.length}`);
  
  // Get the list of database role values that match the selected role filter
  const validRoles = roleMapping[role] || [];
  
  if (role !== 'All') {
    console.log(`Role filter "${role}" maps to database values: [${validRoles.join(', ')}]`);
  }
  
  return players.filter(player => {
    // Check if player's role matches any of the valid roles for the selected filter
    const roleMatch = role === 'All' || (player.role && validRoles.includes(player.role.toLowerCase()));
    
    // Vérifier si la région du joueur correspond
    const regionMatch = region === 'All' || player.teamRegion === region;
    
    // Vérifier si la sous-région du joueur correspond
    const subRegionMatch = subRegion === 'All' || player.teamRegion === subRegion;
    
    // Vérifier si la région du joueur est dans la catégorie sélectionnée
    const categoryMatch = category === 'All' || 
      (regionCategories[category] && regionCategories[category].includes(player.teamRegion || ''));
    
    // Log pour le débogage des filtres rôles
    if (role !== 'All' && !roleMatch) {
      console.log(`Player ${player.name} with role ${player.role} doesn't match selected role ${role}`);
    }
    
    // Application conditionnelle des filtres en fonction des sélections
    let result = false;
    
    if (region !== 'All') {
      // Si une région spécifique est sélectionnée, utiliser la région et le rôle
      result = roleMatch && regionMatch;
    } else if (category !== 'All') {
      // Si une catégorie est sélectionnée, l'utiliser pour filtrer avec le rôle
      result = roleMatch && categoryMatch;
    } else if (subRegion !== 'All') {
      // Si une sous-région est sélectionnée, l'utiliser pour filtrer avec le rôle
      result = roleMatch && subRegionMatch;
    } else {
      // Par défaut, juste filtrer par rôle
      result = roleMatch;
    }
    
    return result;
  });
};
