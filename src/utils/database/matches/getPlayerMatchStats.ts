import { supabase } from '@/integrations/supabase/client';

/**
 * Get player match stats for a specific player
 */
export const getPlayerMatchStats = async (playerId: string) => {
  try {
    const { data, error } = await supabase
      .from('player_match_stats')
      .select('*')
      .eq('player_id', playerId);
    
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
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', playerId)
      .single();
    
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

/**
 * Get team timeline stats for a specific match
 */
export const getTeamTimelineStats = async (matchId: string) => {
  try {
    const { data, error } = await supabase
      .from('team_timeline_stats')
      .select('*')
      .eq('match_id', matchId);
    
    if (error) {
      console.error('Error fetching team timeline stats:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching team timeline stats:', error);
    return null;
  }
};

/**
 * Get player timeline stats for a specific match
 */
export const getPlayerTimelineStats = async (matchId: string) => {
  try {
    const { data, error } = await supabase
      .from('player_timeline_stats')
      .select('*')
      .eq('match_id', matchId);
    
    if (error) {
      console.error('Error fetching player timeline stats:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching player timeline stats:', error);
    return null;
  }
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
    const { data, error } = await supabase
      .from('player_match_stats')
      .select('*')
      .eq('player_id', playerId)
      .eq('match_id', matchId)
      .single();
    
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
