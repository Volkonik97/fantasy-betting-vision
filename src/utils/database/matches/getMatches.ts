
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
    
    // Execute query with explicit result handling
    const queryResult = await query;
    
    if (queryResult.error) {
      console.error("Error fetching matches:", queryResult.error);
      toast.error("Failed to load matches");
      return [];
    }
    
    // Convert data to Match objects using our adapter
    const matches: Match[] = [];
    if (queryResult.data) {
      for (let i = 0; i < queryResult.data.length; i++) {
        matches.push(adaptMatchFromDatabase(queryResult.data[i] as RawDatabaseMatch));
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
      const cacheKeys = Object.keys(matchesCache);
      for (let i = 0; i < cacheKeys.length; i++) {
        const matchList = matchesCache[cacheKeys[i]] || [];
        for (let j = 0; j < matchList.length; j++) {
          if (matchList[j].id === matchId) {
            return matchList[j];
          }
        }
      }
    }
    
    // Try to fetch by ID first
    const idQueryResult = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();
      
    if (idQueryResult.error) {
      console.log(`Failed to load match with ID=${matchId}, trying with gameid:`, idQueryResult.error);
      
      // Try with gameid as fallback
      const gameIdQueryResult = await supabase
        .from('matches')
        .select('*')
        .eq('gameid', matchId)
        .single();
        
      if (gameIdQueryResult.error) {
        console.error(`All attempts to fetch match ${matchId} failed:`, 
          { idError: idQueryResult.error, gameidError: gameIdQueryResult.error });
        toast.error("Match not found");
        return null;
      }
      
      if (!gameIdQueryResult.data) {
        return null;
      }
      
      return adaptMatchFromDatabase(gameIdQueryResult.data as RawDatabaseMatch);
    }
    
    if (!idQueryResult.data) {
      console.error(`No data found for match ${matchId}`);
      toast.error("Match not found");
      return null;
    }
    
    // Convert to Match object
    return adaptMatchFromDatabase(idQueryResult.data as RawDatabaseMatch);
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
    const queryResult = await supabase
      .from('matches')
      .select('*')
      .or(`team1_id.eq.${teamId},team2_id.eq.${teamId},team_blue_id.eq.${teamId},team_red_id.eq.${teamId}`);
    
    if (queryResult.error) {
      console.error(`Error fetching matches for team ${teamId}:`, queryResult.error);
      toast.error("Failed to load team matches");
      return [];
    }
    
    // Convert data to Match objects
    const matches: Match[] = [];
    if (queryResult.data) {
      for (let i = 0; i < queryResult.data.length; i++) {
        matches.push(adaptMatchFromDatabase(queryResult.data[i] as RawDatabaseMatch));
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
