
import { supabase } from "@/integrations/supabase/client";
import { Player } from "@/utils/models/types";
import { adaptPlayerFromDatabase } from "./adapters/playerAdapter";
import { toast } from "sonner";
import { getLoadedPlayers, setLoadedPlayers } from '../csv/cache/dataCache';

export const getPlayerById = async (playerId: string): Promise<Player | null> => {
  try {
    console.log("Fetching player with ID:", playerId);
    
    // First try fetching from player_summary_view which has the vspm, wcpm, and damage_share fields
    const { data: summaryData, error: summaryError } = await supabase
      .from('player_summary_view')
      .select('*')
      .eq('playerid', playerId)
      .single();
    
    if (summaryData) {
      console.log("Found player in player_summary_view:", summaryData);
      console.log("Vision stats from view:", { 
        vspm: summaryData.vspm, 
        wcpm: summaryData.wcpm 
      });
      return adaptPlayerFromDatabase(summaryData);
    }
    
    console.log("Player not found in player_summary_view, trying players table");
    
    // Fall back to the players table if not found in the view
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('playerid', playerId)
      .single();
    
    if (error) {
      console.error("Error fetching player:", error);
      return null;
    }
    
    if (!data) {
      console.warn(`No player found with ID: ${playerId}`);
      return null;
    }
    
    console.log("Found player in players table:", data);
    return adaptPlayerFromDatabase(data);
  } catch (error) {
    console.error("Error in getPlayerById:", error);
    return null;
  }
};

export const getPlayers = async (page?: number, pageSize?: number): Promise<Player[]> => {
  try {
    console.log(`Fetching players (page: ${page}, pageSize: ${pageSize})`);
    
    // Try to use the cache first
    const cachedPlayers = getLoadedPlayers();
    if (cachedPlayers && cachedPlayers.length > 0) {
      console.log(`Retrieved ${cachedPlayers.length} players from cache`);
      
      // If pagination is requested, slice the cached data accordingly
      if (page !== undefined && pageSize !== undefined) {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return cachedPlayers.slice(start, end);
      }
      
      return cachedPlayers;
    }
    
    // Prepare the query to player_summary_view which has vspm and wcpm fields
    let query = supabase.from('player_summary_view').select('*');
    
    // Apply pagination if provided
    if (page !== undefined && pageSize !== undefined) {
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;
      query = query.range(start, end);
    }
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching players from player_summary_view:", error);
      
      // Fall back to players table
      console.log("Falling back to players table");
      let fallbackQuery = supabase.from('players').select('*');
      
      if (page !== undefined && pageSize !== undefined) {
        const start = (page - 1) * pageSize;
        const end = start + pageSize - 1;
        fallbackQuery = fallbackQuery.range(start, end);
      }
      
      const { data: fallbackData, error: fallbackError } = await fallbackQuery;
      
      if (fallbackError) {
        console.error("Error in fallback player fetch:", fallbackError);
        return [];
      }
      
      if (!fallbackData || fallbackData.length === 0) {
        console.warn("No players found");
        return [];
      }
      
      const adaptedPlayers = fallbackData.map(player => adaptPlayerFromDatabase(player));
      console.log(`Retrieved ${adaptedPlayers.length} players from fallback`);
      
      // Only update cache if we fetched all players (no pagination)
      if (page === undefined || pageSize === undefined) {
        setLoadedPlayers(adaptedPlayers);
      }
      
      return adaptedPlayers;
    }
    
    if (!data || data.length === 0) {
      console.warn("No players found in player_summary_view");
      return [];
    }
    
    const adaptedPlayers = data.map(player => adaptPlayerFromDatabase(player));
    console.log(`Retrieved ${adaptedPlayers.length} players from player_summary_view with vision stats`);
    
    // Log some samples of vision stats
    if (adaptedPlayers.length > 0) {
      console.log("Sample vision stats:", {
        player: adaptedPlayers[0].name,
        vspm: adaptedPlayers[0].vspm,
        wcpm: adaptedPlayers[0].wcpm
      });
    }
    
    // Only update cache if we fetched all players (no pagination)
    if (page === undefined || pageSize === undefined) {
      setLoadedPlayers(adaptedPlayers);
    }
    
    return adaptedPlayers;
  } catch (error) {
    console.error("Error in getPlayers:", error);
    toast.error("Erreur lors du chargement des joueurs");
    return [];
  }
};

/**
 * Get the total number of players
 */
export const getPlayersCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('players')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error("Error fetching players count:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Error in getPlayersCount:", error);
    return 0;
  }
};
