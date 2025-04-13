
import { supabase } from "@/integrations/supabase/client";
import { Match } from "@/utils/models/types";
import { toast } from "sonner";
import { adaptMatchFromDatabase, RawDatabaseMatch } from "@/utils/database/adapters/matchAdapter";
import { 
  getMatchesFromCache, 
  storeMatchesInCache 
} from "../cache/matchesCache";

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
    const cachedMatches = getMatchesFromCache(cacheKey);
    if (cachedMatches) {
      return cachedMatches;
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
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching matches:", error);
      toast.error("Failed to load matches");
      return [];
    }
    
    // Convert data to Match objects
    const matches: Match[] = [];
    if (data) {
      for (const matchData of data) {
        matches.push(adaptMatchFromDatabase(matchData as RawDatabaseMatch));
      }
    }
    
    // Update cache
    storeMatchesInCache(cacheKey, matches);
    
    return matches;
  } catch (error) {
    console.error("Unexpected error fetching matches:", error);
    toast.error("An error occurred loading matches");
    return [];
  }
};
