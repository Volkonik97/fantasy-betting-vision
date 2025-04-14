
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
    
    // Try to fetch by ID first
    const idQuery = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId);
      
    if (idQuery.error) {
      console.log(`Failed to load match with ID=${matchId}, trying with gameid:`, idQuery.error);
      
      // Try with gameid as fallback
      const gameIdQuery = await supabase
        .from('matches')
        .select('*')
        .eq('gameid', matchId);
      
      if (gameIdQuery.error) {
        console.error(`All attempts to fetch match ${matchId} failed:`, 
          { idError: idQuery.error, gameIdError: gameIdQuery.error });
        toast.error("Match not found");
        return null;
      }
      
      // Check if we have data
      if (!gameIdQuery.data || gameIdQuery.data.length === 0) {
        console.error(`No data found for match with gameid ${matchId}`);
        toast.error("Match not found");
        return null;
      }
      
      matchData = gameIdQuery.data[0];
    } else {
      // Check if we have data
      if (!idQuery.data || idQuery.data.length === 0) {
        console.error(`No data found for match with id ${matchId}`);
        toast.error("Match not found");
        return null;
      }
      
      matchData = idQuery.data[0];
    }
    
    // Convert to our application model
    return adaptMatchFromDatabase(matchData);
    
  } catch (error) {
    console.error(`Unexpected error in getMatchById(${matchId}):`, error);
    toast.error("Server error");
    return null;
  }
};
