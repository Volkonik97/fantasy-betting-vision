
import { supabase } from "@/integrations/supabase/client";
import { Match } from "@/utils/models/types";
import { toast } from "sonner";
import { adaptMatchFromDatabase, RawDatabaseMatch } from "@/utils/database/adapters/matchAdapter";
import { 
  getTeamMatchesFromCache, 
  storeTeamMatchesInCache 
} from "../cache/matchesCache";

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
    const cachedMatches = getTeamMatchesFromCache(teamId);
    if (cachedMatches) {
      return cachedMatches;
    }
    
    // Try different possible team ID column names
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .or(`team1_id.eq.${teamId},team2_id.eq.${teamId},team_blue_id.eq.${teamId},team_red_id.eq.${teamId}`);
    
    if (error) {
      console.error(`Error fetching matches for team ${teamId}:`, error);
      toast.error("Failed to load team matches");
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
    storeTeamMatchesInCache(teamId, matches);
    
    return matches;
  } catch (error) {
    console.error(`Unexpected error in getMatchesByTeamId(${teamId}):`, error);
    toast.error("Server error");
    return [];
  }
};
