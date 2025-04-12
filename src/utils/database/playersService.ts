
import { supabase } from "@/integrations/supabase/client";
import { Player, PlayerRole } from "@/utils/models/types";
import { toast } from "sonner";
import { adaptPlayerFromDatabase, adaptPlayerForDatabase, RawDatabasePlayer } from "./adapters/playerAdapter";

let playersCache: Record<string, Player> = {};
let cacheExpiryTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Clear players cache
 */
export const clearPlayersCache = () => {
  playersCache = {};
  cacheExpiryTime = 0;
};

/**
 * Get all players from database
 */
export const getPlayers = async (): Promise<Player[]> => {
  try {
    // Check if we have a valid cache
    if (Object.keys(playersCache).length > 0 && Date.now() < cacheExpiryTime) {
      return Object.values(playersCache);
    }
    
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('playername');
      
    if (error) {
      console.error("Error fetching players:", error);
      toast.error("Failed to load players");
      return [];
    }
    
    // Convert to Player objects using adapter
    const players = (data || []).map(p => adaptPlayerFromDatabase(p));
    
    // Update cache
    playersCache = {};
    players.forEach(player => {
      playersCache[player.id] = player;
    });
    cacheExpiryTime = Date.now() + CACHE_DURATION;
    
    return players;
  } catch (error) {
    console.error("Unexpected error in getPlayers:", error);
    toast.error("An error occurred loading players");
    return [];
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
    
    // Convert to database format
    const dbPlayers = players.map(player => adaptPlayerForDatabase(player));
    
    // Perform upsert operation
    const { error } = await supabase
      .from('players')
      .upsert(dbPlayers, {
        onConflict: 'playerid',
        ignoreDuplicates: false
      });
      
    if (error) {
      console.error("Error saving players:", error);
      toast.error("Failed to save players");
      return false;
    }
    
    // Clear cache to ensure fresh data on next fetch
    clearPlayersCache();
    
    toast.success(`${players.length} players saved successfully`);
    return true;
  } catch (error) {
    console.error("Unexpected error in savePlayers:", error);
    toast.error("An error occurred saving players");
    return false;
  }
};

/**
 * Get player by ID
 */
export const getPlayerById = async (playerId: string): Promise<Player | null> => {
  try {
    // Check cache first
    if (playersCache[playerId] && Date.now() < cacheExpiryTime) {
      return playersCache[playerId];
    }
    
    // First try with playerid
    let { data: playerData, error } = await supabase
      .from('players')
      .select('*')
      .eq('playerid', playerId)
      .single();
      
    if (error) {
      console.error(`Error fetching player ${playerId}:`, error);
      
      // Try with id instead of playerid as fallback
      const { data: altData, error: altError } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .single();
        
      if (altError) {
        console.error(`All attempts to fetch player ${playerId} failed:`, altError);
        return null;
      }
      
      // Use altData if playerid lookup failed
      playerData = altData;
    }
    
    if (!playerData) {
      console.log(`No player found with ID ${playerId}`);
      return null;
    }
    
    // Convert to Player object
    const player = adaptPlayerFromDatabase(playerData);
    
    // Update cache
    playersCache[player.id] = player;
    if (Date.now() > cacheExpiryTime) {
      cacheExpiryTime = Date.now() + CACHE_DURATION;
    }
    
    return player;
  } catch (error) {
    console.error(`Error in getPlayerById(${playerId}):`, error);
    return null;
  }
};

/**
 * Get players by team ID
 */
export const getPlayersByTeam = async (teamId: string): Promise<Player[]> => {
  try {
    if (!teamId) {
      console.error("No team ID provided");
      return [];
    }
    
    // Try both possible column names for team_id
    const { data: teamPlayers, error: teamError } = await supabase
      .from('players')
      .select('*')
      .eq('team_id', teamId);
      
    if (teamError) {
      console.error(`Error fetching players for team ${teamId}:`, teamError);
      
      // Try with teamid instead of team_id as fallback
      const { data: altPlayers, error: altError } = await supabase
        .from('players')
        .select('*')
        .eq('teamid', teamId);
        
      if (altError) {
        console.error(`All attempts to fetch team ${teamId} players failed:`, altError);
        toast.error("Failed to load team players");
        return [];
      }
      
      // Convert to Player objects
      return (altPlayers || []).map(p => adaptPlayerFromDatabase(p));
    }
    
    // Convert to Player objects
    return (teamPlayers || []).map(p => adaptPlayerFromDatabase(p));
  } catch (error) {
    console.error(`Error in getPlayersByTeam(${teamId}):`, error);
    toast.error("An error occurred loading team players");
    return [];
  }
};
