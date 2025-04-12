
import { Player } from '@/utils/models/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { adaptPlayerFromDatabase, adaptPlayerForDatabase } from '../adapters/playerAdapter';

/**
 * Get all players from database
 */
export const getPlayers = async (): Promise<Player[]> => {
  try {
    const { data: playersData, error } = await supabase
      .from('players')
      .select('*');

    if (error) {
      console.error("Error fetching players:", error);
      toast.error("Failed to load players");
      return [];
    }

    if (!playersData || playersData.length === 0) {
      return [];
    }

    return playersData.map(adaptPlayerFromDatabase);
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
    const { data: playerData, error } = await supabase
      .from('players')
      .select('*')
      .eq('playerid', playerId)
      .single();

    if (error) {
      console.error("Error fetching player:", error);
      toast.error("Failed to load player details");
      return null;
    }

    if (!playerData) {
      return null;
    }

    return adaptPlayerFromDatabase(playerData);
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
    // Supabase will map the fields correctly at runtime
    const { error } = await supabase
      .from('players')
      .upsert(dbPlayers as any, {
        onConflict: 'playerid',
        ignoreDuplicates: false
      });

    if (error) {
      console.error("Error saving players:", error);
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
