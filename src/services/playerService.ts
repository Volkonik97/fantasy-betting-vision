
import { supabase } from "@/integrations/supabase/client";
import { Player, PlayerRole } from "@/utils/models/types";
import { toast } from "sonner";

/**
 * Maps a string position to the PlayerRole type
 */
export const mapStringToPlayerRole = (position: string): PlayerRole => {
  const normalizedPosition = position?.toLowerCase() || '';
  
  if (normalizedPosition.includes('top')) return 'Top';
  if (normalizedPosition.includes('jng') || normalizedPosition.includes('jungle')) return 'Jungle';
  if (normalizedPosition.includes('mid')) return 'Mid';
  if (normalizedPosition.includes('bot') || normalizedPosition.includes('adc')) return 'ADC';
  if (normalizedPosition.includes('sup')) return 'Support';
  
  return 'Unknown';
};

/**
 * Fetches all players from the database
 */
export const getAllPlayers = async (): Promise<Player[]> => {
  try {
    console.log("Fetching all players from players table");
    
    const { data, error } = await supabase
      .from('players')
      .select('*');
    
    if (error) {
      console.error("Error fetching players:", error);
      toast.error("Failed to load players");
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log("No players found in database");
      return [];
    }
    
    console.log(`Retrieved ${data.length} players from database`);
    
    // Map database players to our application Player model
    return data.map(player => ({
      id: player.playerid || '',
      name: player.playername || '',
      role: mapStringToPlayerRole(player.position || ''),
      image: player.image || '',
      team: player.teamid || '',
      // Stats fields
      kda: player.kda || 0,
      csPerMin: player.cspm || 0,
      damageShare: player.damage_share || 0,
      championPool: player.champion_pool ? String(player.champion_pool) : '0',
      // Additional stats
      avg_kills: player.avg_kills || 0,
      avg_deaths: player.avg_deaths || 0,
      avg_assists: player.avg_assists || 0,
      cspm: player.cspm || 0,
      dpm: player.dpm || 0,
      earned_gpm: player.earned_gpm || 0,
      earned_gold_share: player.earned_gold_share || 0,
      vspm: player.vspm || 0,
      wcpm: player.wcpm || 0,
      // Early game stats
      avg_golddiffat15: player.avg_golddiffat15 || 0,
      avg_xpdiffat15: player.avg_xpdiffat15 || 0,
      avg_csdiffat15: player.avg_csdiffat15 || 0,
      // First blood stats
      avg_firstblood_kill: player.avg_firstblood_kill || 0,
      avg_firstblood_assist: player.avg_firstblood_assist || 0,
      avg_firstblood_victim: player.avg_firstblood_victim || 0
    }));
  } catch (error) {
    console.error("Exception in getAllPlayers:", error);
    toast.error("An error occurred while loading players");
    return [];
  }
};

/**
 * Gets a player by their ID
 */
export const getPlayerById = async (playerId: string): Promise<Player | null> => {
  try {
    if (!playerId) {
      console.error("No player ID provided");
      return null;
    }
    
    console.log(`Getting player with ID: ${playerId}`);
    
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('playerid', playerId)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching player:", error);
      toast.error("Failed to load player details");
      return null;
    }
    
    if (!data) {
      console.log(`No player found with ID: ${playerId}`);
      return null;
    }
    
    return {
      id: data.playerid || '',
      name: data.playername || '',
      role: mapStringToPlayerRole(data.position || ''),
      image: data.image || '',
      team: data.teamid || '',
      // Stats fields
      kda: data.kda || 0,
      csPerMin: data.cspm || 0,
      damageShare: data.damage_share || 0,
      championPool: data.champion_pool ? String(data.champion_pool) : '0',
      // Additional stats
      avg_kills: data.avg_kills || 0,
      avg_deaths: data.avg_deaths || 0,
      avg_assists: data.avg_assists || 0,
      cspm: data.cspm || 0,
      dpm: data.dpm || 0,
      earned_gpm: data.earned_gpm || 0,
      earned_gold_share: data.earned_gold_share || 0,
      vspm: data.vspm || 0,
      wcpm: data.wcpm || 0,
      // Early game stats
      avg_golddiffat15: data.avg_golddiffat15 || 0,
      avg_xpdiffat15: data.avg_xpdiffat15 || 0,
      avg_csdiffat15: data.avg_csdiffat15 || 0,
      // First blood stats
      avg_firstblood_kill: data.avg_firstblood_kill || 0,
      avg_firstblood_assist: data.avg_firstblood_assist || 0,
      avg_firstblood_victim: data.avg_firstblood_victim || 0
    };
  } catch (error) {
    console.error("Exception in getPlayerById:", error);
    toast.error("An error occurred while fetching player details");
    return null;
  }
};
