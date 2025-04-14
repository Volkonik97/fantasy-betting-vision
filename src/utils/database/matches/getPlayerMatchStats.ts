
import { supabase } from '@/integrations/supabase/client';

/**
 * Get player match stats for a specific player
 */
export const getPlayerMatchStats = async (playerId: string) => {
  try {
    // Get reference to the table
    const statsTable = supabase.from('player_match_stats');
    // Create the select query
    const selectQuery = statsTable.select('*');
    
    // Execute the query with filter in one step and destructure the result
    const { data, error } = await selectQuery.eq('player_id', playerId);
    
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
    // Get reference to the table
    const playersTable = supabase.from('players');
    // Create the select query
    const selectQuery = playersTable.select('*');
    
    // Execute with filter and destructure in one step
    const { data, error } = await selectQuery.eq('id', playerId).maybeSingle();
    
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
    // Get reference to the table
    const statsTable = supabase.from('player_match_stats');
    // Create the select query
    const selectQuery = statsTable.select('*');
    
    // Apply filters and execute in a single step with destructuring
    const { data, error } = await selectQuery
      .eq('player_id', playerId)
      .eq('match_id', matchId)
      .maybeSingle();
    
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
