
import { supabase } from '@/integrations/supabase/client';

/**
 * Get player match stats for a specific player
 */
export const getPlayerMatchStats = async (playerId: string) => {
  try {
    // Break up the query chain completely to avoid excessive type instantiation
    const statsTable = supabase.from('player_match_stats');
    const query = statsTable.select('*');
    const filteredQuery = query.eq('player_id', playerId);
    const response = await filteredQuery;
    
    // Extract data and error properties
    const data = response.data;
    const error = response.error;
    
    if (error) {
      console.error('Error fetching player match stats:', error);
      return null;
    }
    
    return data;
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
    // Break up the query chain completely to avoid excessive type instantiation
    const playersTable = supabase.from('players');
    const query = playersTable.select('*');
    const filteredQuery = query.eq('id', playerId);
    const response = await filteredQuery.maybeSingle();
    
    // Extract data and error properties
    const data = response.data;
    const error = response.error;
    
    if (error) {
      console.error('Error fetching player stats:', error);
      return null;
    }
    
    return data;
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
    // Break up the query chain completely to avoid excessive type instantiation
    const statsTable = supabase.from('player_match_stats');
    const query = statsTable.select('*');
    const playerFilteredQuery = query.eq('player_id', playerId);
    const matchFilteredQuery = playerFilteredQuery.eq('match_id', matchId);
    const response = await matchFilteredQuery.maybeSingle();
    
    // Extract data and error properties
    const data = response.data;
    const error = response.error;
    
    if (error) {
      console.error('Error fetching player match stats:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching player match stats:', error);
    return null;
  }
};
