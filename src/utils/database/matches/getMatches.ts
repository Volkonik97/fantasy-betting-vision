
import { supabase } from "@/integrations/supabase/client";
import { Match } from "@/utils/models/types";
import { toast } from "sonner";
import { adaptMatchFromDatabase, RawDatabaseMatch } from "../adapters/matchAdapter";

// Cache system for matches
let matchesCache: Record<string, Match[]> = {};
let matchesByTeamCache: Record<string, Match[]> = {};
let cacheTimeStamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Clears the matches cache
 */
export const clearMatchCache = (): void => {
  matchesCache = {};
  matchesByTeamCache = {};
  cacheTimeStamp = 0;
};

/**
 * Gets all matches from database
 */
export const getMatches = async (
  limit = 100,
  tournamentFilter?: string
): Promise<Match[]> => {
  try {
    const cacheKey = `${limit}-${tournamentFilter || 'all'}`;
    
    // Check if we have cached data
    if (
      matchesCache[cacheKey] && 
      Date.now() - cacheTimeStamp < CACHE_DURATION
    ) {
      return matchesCache[cacheKey];
    }
    
    // Build query
    let query = supabase
      .from('matches')
      .select('*')
      .order('date', { ascending: false })
      .limit(limit);
      
    // Add tournament filter if specified
    if (tournamentFilter) {
      query = query.eq('tournament', tournamentFilter);
    }
    
    // Execute query
    const response = await query;
    const data = response.data;
    const error = response.error;
    
    if (error) {
      console.error("Error fetching matches:", error);
      toast.error("Failed to load matches");
      return [];
    }
    
    // Convert data to Match objects using our adapter
    const matches: Match[] = [];
    if (data) {
      for (let i = 0; i < data.length; i++) {
        const matchData = data[i];
        matches.push(adaptMatchFromDatabase(matchData as RawDatabaseMatch));
      }
    }
    
    // Update cache
    matchesCache[cacheKey] = matches;
    cacheTimeStamp = Date.now();
    
    return matches;
  } catch (error) {
    console.error("Unexpected error fetching matches:", error);
    toast.error("An error occurred loading matches");
    return [];
  }
};

/**
 * Gets a specific match by ID
 */
export const getMatchById = async (matchId: string): Promise<Match | null> => {
  try {
    if (!matchId) {
      console.error("No match ID provided");
      return null;
    }
    
    // Check in cache first
    const now = Date.now();
    if (now - cacheTimeStamp < CACHE_DURATION) {
      // Search in all cache entries
      const cacheKeys = Object.keys(matchesCache);
      for (let i = 0; i < cacheKeys.length; i++) {
        const key = cacheKeys[i];
        const matchList = matchesCache[key] || [];
        for (let j = 0; j < matchList.length; j++) {
          if (matchList[j].id === matchId) {
            return matchList[j];
          }
        }
      }
    }
    
    // Try to fetch by ID first
    const idResponse = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();
    
    const idData = idResponse.data;
    const idError = idResponse.error;
      
    if (idError) {
      console.log(`Failed to load match with ID=${matchId}, trying with gameid:`, idError);
      
      // Try with gameid as fallback
      const gameidResponse = await supabase
        .from('matches')
        .select('*')
        .eq('gameid', matchId)
        .single();
      
      const gameidData = gameidResponse.data;
      const gameidError = gameidResponse.error;
        
      if (gameidError) {
        console.error(`All attempts to fetch match ${matchId} failed:`, 
          { idError, gameidError });
        toast.error("Match not found");
        return null;
      }
      
      if (!gameidData) {
        return null;
      }
      
      return adaptMatchFromDatabase(gameidData as RawDatabaseMatch);
    }
    
    if (!idData) {
      console.error(`No data found for match ${matchId}`);
      toast.error("Match not found");
      return null;
    }
    
    // Convert to Match object
    return adaptMatchFromDatabase(idData as RawDatabaseMatch);
  } catch (error) {
    console.error(`Unexpected error in getMatchById(${matchId}):`, error);
    toast.error("Server error");
    return null;
  }
};

/**
 * Gets all matches for a specific team
 */
export const getMatchesByTeamId = async (teamId: string): Promise<Match[]> => {
  try {
    if (!teamId) {
      console.error("No team ID provided for match search");
      return [];
    }
    
    // Check cache first
    if (
      matchesByTeamCache[teamId] && 
      Date.now() - cacheTimeStamp < CACHE_DURATION
    ) {
      return matchesByTeamCache[teamId];
    }
    
    // Try different possible team ID column names
    const response = await supabase
      .from('matches')
      .select('*')
      .or(`team1_id.eq.${teamId},team2_id.eq.${teamId},team_blue_id.eq.${teamId},team_red_id.eq.${teamId}`);
    
    const data = response.data;
    const error = response.error;
    
    if (error) {
      console.error(`Error fetching matches for team ${teamId}:`, error);
      toast.error("Failed to load team matches");
      return [];
    }
    
    // Convert data to Match objects
    const matches: Match[] = [];
    if (data) {
      for (let i = 0; i < data.length; i++) {
        const matchData = data[i];
        matches.push(adaptMatchFromDatabase(matchData as RawDatabaseMatch));
      }
    }
    
    // Update cache
    matchesByTeamCache[teamId] = matches;
    cacheTimeStamp = Date.now();
    
    return matches;
  } catch (error) {
    console.error(`Unexpected error in getMatchesByTeamId(${teamId}):`, error);
    toast.error("Server error");
    return [];
  }
};
