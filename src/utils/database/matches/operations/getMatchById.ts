
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
    const idResponse = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .maybeSingle();
    
    // Extract data and error explicitly with direct property access to avoid deep type inference
    const idData = idResponse.data as RawDatabaseMatch | null;
    const idError = idResponse.error;
      
    if (idError) {
      console.log(`Failed to load match with ID=${matchId}, trying with gameid:`, idError);
      
      // Try with gameid as fallback
      const gameIdResponse = await supabase
        .from('matches')
        .select('*')
        .eq('gameid', matchId)
        .maybeSingle();
      
      // Extract data and error explicitly with direct property access to avoid deep type inference
      const gameIdData = gameIdResponse.data as RawDatabaseMatch | null;
      const gameIdError = gameIdResponse.error;
        
      if (gameIdError) {
        console.error(`All attempts to fetch match ${matchId} failed:`, 
          { idError, gameidError: gameIdError });
        toast.error("Match not found");
        return null;
      }
      
      if (!gameIdData) {
        return null;
      }
      
      return adaptMatchFromDatabase(gameIdData);
    }
    
    if (!idData) {
      console.error(`No data found for match ${matchId}`);
      toast.error("Match not found");
      return null;
    }
    
    // Convert to Match object
    return adaptMatchFromDatabase(idData);
  } catch (error) {
    console.error(`Unexpected error in getMatchById(${matchId}):`, error);
    toast.error("Server error");
    return null;
  }
};
