
import { supabase } from "@/integrations/supabase/client";
import { Match } from "@/utils/models/types";
import { toast } from "sonner";
import { adaptMatchFromDatabase, RawDatabaseMatch } from "@/utils/database/adapters/match";
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
    // Execute the query without type inference
    let response: any;
    
    try {
      response = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .maybeSingle();
    } catch (e) {
      console.error("Error executing ID query:", e);
      return null;
    }
    
    // Manually extract and type the response parts
    const idData = response.data as any;
    const idError = response.error as any;
    
    // Handle by ID response
    if (idError) {
      console.log(`Failed to load match with ID=${matchId}, trying with gameid:`, idError);
      
      // Try with gameid as fallback
      // Execute the query without type inference
      let gameIdResponse: any;
      
      try {
        gameIdResponse = await supabase
          .from('matches')
          .select('*')
          .eq('gameid', matchId)
          .maybeSingle();
      } catch (e) {
        console.error("Error executing gameid query:", e);
        return null;
      }
      
      // Manually extract and type
      const gameIdData = gameIdResponse.data as any;
      const gameIdError = gameIdResponse.error as any;
      
      // Handle gameid response
      if (gameIdError) {
        console.error(`All attempts to fetch match ${matchId} failed:`, 
          { idError, gameidError: gameIdError });
        toast.error("Match not found");
        return null;
      }
      
      // Check if we have data
      if (!gameIdData) {
        return null;
      }
      
      // Convert to our application model
      return adaptMatchFromDatabase(gameIdData);
    }
    
    // Check if we have data from ID query
    if (!idData) {
      console.error(`No data found for match ${matchId}`);
      toast.error("Match not found");
      return null;
    }
    
    // Convert to our application model
    return adaptMatchFromDatabase(idData);
    
  } catch (error) {
    console.error(`Unexpected error in getMatchById(${matchId}):`, error);
    toast.error("Server error");
    return null;
  }
};
