
import { Player } from '@/utils/models/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { adaptPlayerFromDatabase, adaptPlayerForDatabase } from '../adapters/playerAdapter';

/**
 * Get players with pagination
 */
export const getPlayers = async (page = 0, pageSize = 0): Promise<Player[]> => {
  try {
    console.log(`Fetching players from Supabase ${page && pageSize ? `(page ${page}, pageSize ${pageSize})` : '(all players)'}`);
    
    // Explicitly select all required fields including 'image'
    let query = supabase.from('players').select('playerid, playername, position, image, teamid, kda, cspm, dpm, damage_share, vspm, wcpm');
    
    // Apply pagination only if both parameters are provided and greater than 0
    if (page > 0 && pageSize > 0) {
      // Calculate range for pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
    }
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching players:", error);
      toast.error("Failed to load players");
      return [];
    }

    if (!data || data.length === 0) {
      console.log("No players found in database");
      
      // Debug: Check if the table exists and has data
      const { count, error: countError } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true }) as { count: number; error: any };
      
      if (countError) {
        console.error("Error checking players table:", countError);
      } else {
        console.log(`Players table exists with ${count} records`);
        if (count > 0) {
          // If there are records but our query returned none, there might be an issue with the query or filters
          console.log("Players exist but none matched the query criteria");
        }
      }
      
      return [];
    }

    const logMessage = page > 0 && pageSize > 0
      ? `Found ${data.length} players in database (page ${page})`
      : `Found ${data.length} players in database (all players)`;
    console.log(logMessage);
    
    // Log first 3 players for debugging
    if (data.length > 0) {
      console.log("Sample player data:", data.slice(0, 3).map(p => ({
        id: p.playerid,
        name: p.playername,
        position: p.position
      })));
    }
    
    // Log image information
    const playersWithImages = data.filter(p => p.image).length;
    console.log(`Players with images: ${playersWithImages}/${data.length}`);
    
    // Use adaptPlayerFromDatabase to convert database format to application model
    const adaptedPlayers = data.map(adaptPlayerFromDatabase)
      // Filter out any invalid players (missing required fields)
      .filter(player => player.id && player.name);
    
    console.log(`Returning ${adaptedPlayers.length} valid players after adaptation`);
    return adaptedPlayers;
  } catch (error) {
    console.error("Exception in getPlayers:", error);
    toast.error("An error occurred while fetching players");
    return [];
  }
};

/**
 * Get total count of players (for pagination)
 */
export const getPlayersCount = async (): Promise<number> => {
  try {
    const response = await supabase
      .from('players')
      .select('playerid', { count: 'exact', head: true }) as { count: number; error: any };
    
    if (response.error) {
      console.error("Error counting players:", response.error);
      return 0;
    }
    
    return response.count || 0;
  } catch (error) {
    console.error("Exception in getPlayersCount:", error);
    return 0;
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
    
    // Use explicit typing to avoid type inference errors
    const response = await supabase
      .from('players')
      .select('*')
      .eq('playerid', playerId)
      .maybeSingle() as { data: any; error: any }; // Changed from .single() to .maybeSingle()

    if (response.error) {
      console.error(`Error fetching player (ID: ${playerId}):`, response.error);
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
    console.error(`Exception in getPlayerById (ID: ${playerId}):`, error);
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
  getPlayersCount,
  getPlayerById,
  savePlayers
};
