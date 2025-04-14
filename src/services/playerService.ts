
import { Player } from '@/utils/models/types';
import { getPlayers, getPlayerById } from '@/utils/database/playersService';

/**
 * Get all players with optional pagination
 */
export const getAllPlayers = async (page?: number, pageSize?: number): Promise<Player[]> => {
  try {
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
 * Get player search results
 */
export const searchPlayers = async (query: string): Promise<Player[]> => {
  try {
    const allPlayers = await getPlayers();
    if (!query || query.trim() === "") return [];

    const lowercaseQuery = query.toLowerCase();
    return allPlayers.filter(player => 
      player.name.toLowerCase().includes(lowercaseQuery)
    );
  } catch (error) {
    console.error("Error in searchPlayers:", error);
    return [];
  }
};
