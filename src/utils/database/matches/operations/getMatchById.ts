
import { supabase } from "@/integrations/supabase/client";
import { Match } from "@/utils/models/types";
import { toast } from "sonner";
import { adaptMatchFromDatabase } from "@/utils/database/adapters/match";
import { findMatchInCache } from "../cache/matchesCache";

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
    const cachedMatch = findMatchInCache(matchId);
    if (cachedMatch) {
      return cachedMatch;
    }
    
    // First try to get match by ID
    let matchData = null;
    let matchError = null;
    
    // Try to fetch by ID first
    const idQuery = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .maybeSingle();
      
    if (idQuery.error) {
      console.log(`Failed to load match with ID=${matchId}, trying with gameid:`, idQuery.error);
      matchError = idQuery.error;
      
      // Try with gameid as fallback
      const gameIdQuery = await supabase
        .from('matches')
        .select('*')
        .eq('gameid', matchId)
        .maybeSingle();
      
      if (gameIdQuery.error) {
        console.error(`All attempts to fetch match ${matchId} failed:`, 
          { idError: idQuery.error, gameIdError: gameIdQuery.error });
        toast.error("Match not found");
        return null;
      }
      
      // Use gameId result if available
      matchData = gameIdQuery.data;
    } else {
      // Use id result if available
      matchData = idQuery.data;
    }
    
    // Check if we have data
    if (!matchData) {
      console.error(`No data found for match ${matchId}`);
      toast.error("Match not found");
      return null;
    }
    
    // Convert to our application model
    return adaptMatchFromDatabase(matchData);
    
  } catch (error) {
    console.error(`Unexpected error in getMatchById(${matchId}):`, error);
    toast.error("Server error");
    return null;
  }
};
