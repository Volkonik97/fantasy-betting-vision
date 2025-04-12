
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Cache for team match stats
let teamStatsCache: Record<string, any[]> = {};
let cacheTimeStamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in ms

/**
 * Gets all team match statistics for a specific team
 */
export const getTeamMatchStats = async (teamId: string): Promise<any[]> => {
  try {
    if (!teamId) {
      console.error("No team ID provided");
      return [];
    }
    
    const cacheKey = `team_${teamId}`;
    
    // Check if stats are in cache and not expired
    if (
      teamStatsCache[cacheKey] && 
      Date.now() - cacheTimeStamp < CACHE_DURATION
    ) {
      return teamStatsCache[cacheKey];
    }
    
    // If no cache or expired, get data from the database
    const { data, error } = await supabase
      .from('team_match_stats')
      .select('*')
      .eq('team_id', teamId)
      .order('match_id');
      
    if (error) {
      console.error(`Error fetching stats for team ${teamId}:`, error);
      toast.error("Failed to load team statistics");
      return [];
    }
    
    // If the table team_match_stats doesn't exist, we'll get an error
    if (error && error.message.includes('does not exist')) {
      console.warn("team_match_stats table does not exist yet. Returning empty array.");
      return [];
    }
    
    // Update cache
    teamStatsCache[cacheKey] = data || [];
    cacheTimeStamp = Date.now();
    
    return data || [];
  } catch (error) {
    console.error(`Error in getTeamMatchStats:`, error);
    toast.error("An error occurred loading team statistics");
    return [];
  }
};

/**
 * Gets all team match statistics
 */
export const getAllTeamMatchStats = async (): Promise<any[]> => {
  try {
    const cacheKey = 'all_teams';
    
    // Check if stats are in cache and not expired
    if (
      teamStatsCache[cacheKey] && 
      Date.now() - cacheTimeStamp < CACHE_DURATION
    ) {
      return teamStatsCache[cacheKey];
    }
    
    // If no cache or expired, get data from the database
    const { data, error } = await supabase
      .from('team_match_stats')
      .select('*')
      .order('match_id');
      
    if (error) {
      // If the table team_match_stats doesn't exist, we'll get an error
      if (error.message.includes('does not exist')) {
        console.warn("team_match_stats table does not exist yet. Returning empty array.");
        return [];
      }
      
      console.error('Error fetching all team match stats:', error);
      toast.error("Failed to load team statistics");
      return [];
    }
    
    // Update cache
    teamStatsCache[cacheKey] = data || [];
    cacheTimeStamp = Date.now();
    
    return data || [];
  } catch (error) {
    console.error(`Error in getAllTeamMatchStats:`, error);
    toast.error("An error occurred loading team statistics");
    return [];
  }
};

/**
 * Gets team statistics for a specific match
 */
export const getMatchTeamStats = async (matchId: string): Promise<any[]> => {
  try {
    if (!matchId) {
      console.error("No match ID provided");
      return [];
    }
    
    const cacheKey = `match_${matchId}`;
    
    // Check if stats are in cache and not expired
    if (
      teamStatsCache[cacheKey] && 
      Date.now() - cacheTimeStamp < CACHE_DURATION
    ) {
      return teamStatsCache[cacheKey];
    }
    
    // If no cache or expired, get data from the database
    const { data, error } = await supabase
      .from('team_match_stats')
      .select('*')
      .eq('match_id', matchId);
      
    if (error) {
      // If the table team_match_stats doesn't exist, we'll get an error
      if (error.message.includes('does not exist')) {
        console.warn("team_match_stats table does not exist yet. Returning empty array.");
        return [];
      }
      
      console.error(`Error fetching stats for match ${matchId}:`, error);
      toast.error("Failed to load match statistics");
      return [];
    }
    
    // Update cache
    teamStatsCache[cacheKey] = data || [];
    cacheTimeStamp = Date.now();
    
    return data || [];
  } catch (error) {
    console.error(`Error in getMatchTeamStats:`, error);
    toast.error("An error occurred loading match statistics");
    return [];
  }
};
