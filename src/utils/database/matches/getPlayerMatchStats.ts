
import { supabase } from '@/integrations/supabase/client';

/**
 * Get player match stats for a specific player
 */
export const getPlayerMatchStats = async (playerId: string) => {
  try {
    // Fetch all player match stats and filter manually
    const result = await supabase.from('player_match_stats').select('*');
    
    if (result.error) {
      console.error('Error fetching player match stats:', result.error);
      return null;
    }
    
    // Filter the results after fetching
    const playerStats = result.data.filter(stat => stat.player_id === playerId);
    return playerStats;
  } catch (error) {
    console.error('Error fetching player match stats:', error);
    return null;
  }
};

/**
 * Get player stats for a specific player
 */
export const getPlayerStats = async (playerId: string) => {
  try {
    // Fetch all players data and filter manually
    const result = await supabase.from('players').select('*');
    
    if (result.error) {
      console.error('Error fetching player stats:', result.error);
      return null;
    }
    
    // Find the specific player - use playerid which is the key in the players table
    const playerData = result.data.find(player => player.playerid === playerId);
    return playerData || null;
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return null;
  }
};

// Note: The following functions have been commented out because the tables they reference
// don't exist in the current database schema. Uncomment and configure them when these tables are added.

/**
 * Get team timeline stats for a specific match - placeholder for future implementation
 */
export const getTeamTimelineStats = async (matchId: string) => {
  console.log(`Team timeline stats for match ${matchId} are not available yet`);
  return null;
};

/**
 * Get player timeline stats for a specific match - placeholder for future implementation
 */
export const getPlayerTimelineStats = async (matchId: string) => {
  console.log(`Player timeline stats for match ${matchId} are not available yet`);
  return null;
};

// Invalidate cache for player stats
export const clearPlayerStatsCache = () => {
  console.log('Clearing player stats cache');
};

/**
 * Get player match stats for a specific player and match
 * This function uses the existing getPlayerMatchStats for backwards compatibility
 */
export const getPlayerMatchStatsByPlayerAndMatch = async (playerId: string, matchId: string) => {
  try {
    // Fetch all relevant stats and filter manually
    const result = await supabase.from('player_match_stats').select('*');
    
    if (result.error) {
      console.error('Error fetching player match stats:', result.error);
      return null;
    }
    
    // Apply multiple filters after fetching
    const playerMatchStat = result.data.find(
      stat => stat.player_id === playerId && stat.match_id === matchId
    );
    
    return playerMatchStat || null;
  } catch (error) {
    console.error('Error fetching player match stats:', error);
    return null;
  }
};
