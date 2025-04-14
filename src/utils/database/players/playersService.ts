
import { Player } from '@/utils/models/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { adaptPlayerFromDatabase, adaptPlayerForDatabase } from '../adapters/playerAdapter';

/**
 * Get all players from database
 */
export const getPlayers = async (): Promise<Player[]> => {
  try {
    console.log("Fetching all players from Supabase");
    
    // Utiliser un typage explicite pour éviter les erreurs d'inférence de type
    const response = await supabase
      .from('players')
      .select('*') as { data: any[]; error: any };
    
    if (response.error) {
      console.error("Error fetching players:", response.error);
      toast.error("Failed to load players");
      return [];
    }

    if (!response.data || response.data.length === 0) {
      console.log("No players found in database");
      return [];
    }

    console.log(`Found ${response.data.length} players in database`);
    return response.data.map(adaptPlayerFromDatabase);
  } catch (error) {
    console.error("Exception in getPlayers:", error);
    toast.error("An error occurred while fetching players");
    return [];
  }
};

/**
 * Get player by ID
 */
export const getPlayerById = async (playerId: string): Promise<Player | null> => {
  try {
    if (!playerId) {
      console.error("No player ID provided");
      return null;
    }
    
    console.log(`Fetching player details for ID: ${playerId}`);
    
    // Utiliser un typage explicite pour éviter les erreurs d'inférence de type
    const response = await supabase
      .from('players')
      .select('*')
      .eq('playerid', playerId)
      .single() as { data: any; error: any };

    if (response.error) {
      console.error("Error fetching player:", response.error);
      toast.error("Failed to load player details");
      return null;
    }

    if (!response.data) {
      console.log(`No player found with ID: ${playerId}`);
      return null;
    }

    console.log(`Successfully fetched player: ${response.data.playername}`);
    return adaptPlayerFromDatabase(response.data);
  } catch (error) {
    console.error("Exception in getPlayerById:", error);
    toast.error("An error occurred while fetching player details");
    return null;
  }
};

/**
 * Save players to database
 */
export const savePlayers = async (players: Player[]): Promise<boolean> => {
  try {
    if (!players || players.length === 0) {
      console.log("No players to save");
      return true;
    }

    console.log(`Saving ${players.length} players to database`);

    // Convert to database format for upsert
    const dbPlayers = players.map(player => adaptPlayerForDatabase(player));

    // Perform upsert operation with explicit cast to bypass type checking
    const response = await supabase
      .from('players')
      .upsert(dbPlayers as any, {
        onConflict: 'playerid',
        ignoreDuplicates: false
      }) as { error: any };

    if (response.error) {
      console.error("Error saving players:", response.error);
      toast.error("Failed to save players to database");
      return false;
    }

    console.log(`Successfully saved ${players.length} players`);
    return true;
  } catch (error) {
    console.error("Exception in savePlayers:", error);
    toast.error("An error occurred while saving players");
    return false;
  }
};

export default {
  getPlayers,
  getPlayerById,
  savePlayers
};
