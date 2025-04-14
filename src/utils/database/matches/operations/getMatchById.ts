
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
    const idResult = await supabase.from('matches').select('*');
    
    // Filter after getting the data - use 'gameid' instead of 'id' since that's the actual field name in the DB
    const idFiltered = idResult.data?.filter(match => match.gameid === matchId);
    
    if (idResult.error) {
      console.log(`Failed to load match with ID=${matchId}, trying with gameid:`, idResult.error);
      
      // Try with gameid as fallback (though this is redundant now since we're already using gameid)
      const gameIdResult = await supabase.from('matches').select('*');
      const gameIdFiltered = gameIdResult.data?.filter(match => match.gameid === matchId);
      
      if (gameIdResult.error) {
        console.error(`All attempts to fetch match ${matchId} failed:`, 
          { idError: idResult.error, gameIdError: gameIdResult.error });
        toast.error("Match not found");
        return null;
      }
      
      // Check if we have data
      if (!gameIdFiltered || gameIdFiltered.length === 0) {
        console.error(`No data found for match with gameid ${matchId}`);
        toast.error("Match not found");
        return null;
      }
      
      matchData = gameIdFiltered[0];
    } else {
      // Check if we have data
      if (!idFiltered || idFiltered.length === 0) {
        console.error(`No data found for match with id ${matchId}`);
        toast.error("Match not found");
        return null;
      }
      
      matchData = idFiltered[0];
    }
    
    // Convert to our application model
    return adaptMatchFromDatabase(matchData);
    
  } catch (error) {
    console.error(`Unexpected error in getMatchById(${matchId}):`, error);
    toast.error("Server error");
    return null;
  }
};
