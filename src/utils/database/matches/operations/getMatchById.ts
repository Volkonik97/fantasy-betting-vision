
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
    
    // Try to fetch by ID first
    const response = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .maybeSingle();
    
    if (response.error) {
      console.log(`Failed to load match with ID=${matchId}, trying with gameid:`, response.error);
      
      // Try with gameid as fallback
      const gameIdResponse = await supabase
        .from('matches')
        .select('*')
        .eq('gameid', matchId)
        .maybeSingle();
      
      if (gameIdResponse.error) {
        console.error(`All attempts to fetch match ${matchId} failed:`, 
          { idError: response.error, gameIdError: gameIdResponse.error });
        toast.error("Match not found");
        return null;
      }
      
      // Check if we have data
      if (!gameIdResponse.data) {
        return null;
      }
      
      // Convert to our application model
      return adaptMatchFromDatabase(gameIdResponse.data);
    }
    
    // Check if we have data from ID query
    if (!response.data) {
      console.error(`No data found for match ${matchId}`);
      toast.error("Match not found");
      return null;
    }
    
    // Convert to our application model
    return adaptMatchFromDatabase(response.data);
    
  } catch (error) {
    console.error(`Unexpected error in getMatchById(${matchId}):`, error);
    toast.error("Server error");
    return null;
  }
};
