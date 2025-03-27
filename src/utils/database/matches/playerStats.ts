
import { supabase } from '@/integrations/supabase/client';
import { getTimelineStats } from '../../statistics/timelineStats';

// Cache pour éviter de récupérer plusieurs fois les mêmes données
const playerStatsCache: Record<string, any[]> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const lastFetch: Record<string, number> = {};

/**
 * Get player match statistics for a team
 */
export const getPlayerMatchStats = async (teamId: string, matchIds?: string[]): Promise<any[]> => {
  try {
    const cacheKey = `team_${teamId}_${matchIds?.join('_') || 'all'}`;
    const now = Date.now();
    
    // Check cache first
    if (playerStatsCache[cacheKey] && lastFetch[cacheKey] && (now - lastFetch[cacheKey] < CACHE_DURATION)) {
      console.log(`Using cached player stats for team ${teamId}`);
      return playerStatsCache[cacheKey];
    }
    
    console.log(`Fetching player stats for team ${teamId}`);
    
    // Build query
    let query = supabase
      .from('player_match_stats')
      .select('*')
      .eq('team_id', teamId);
    
    // Filter by match IDs if provided
    if (matchIds && matchIds.length > 0) {
      query = query.in('match_id', matchIds);
    }
    
    // Execute query
    const { data: playerStats, error } = await query;
    
    if (error) {
      console.error(`Error fetching player match stats for team ${teamId}:`, error);
      return [];
    }
    
    if (!playerStats || playerStats.length === 0) {
      console.log(`No player match stats found for team ${teamId}`);
      return [];
    }
    
    // Update cache
    playerStatsCache[cacheKey] = playerStats;
    lastFetch[cacheKey] = now;
    
    return playerStats;
  } catch (error) {
    console.error(`Error in getPlayerMatchStats for team ${teamId}:`, error);
    return [];
  }
};

/**
 * Get timeline statistics for a team based on player match stats
 */
export const getTeamTimelineStats = async (teamId: string): Promise<any> => {
  try {
    const playerStats = await getPlayerMatchStats(teamId);
    
    if (!playerStats || playerStats.length === 0) {
      return null;
    }
    
    return getTimelineStats(playerStats);
  } catch (error) {
    console.error(`Error getting timeline stats for team ${teamId}:`, error);
    return null;
  }
};
