
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
    // Use a raw response approach to bypass deep type instantiation
    const idResponseRaw = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .maybeSingle();
    
    // Explicitly type the response parts to avoid deep inference
    const idData = idResponseRaw.data as RawDatabaseMatch | null;
    const idError = idResponseRaw.error;
    
    // Handle by ID response
    if (idError) {
      console.log(`Failed to load match with ID=${matchId}, trying with gameid:`, idError);
      
      // Try with gameid as fallback
      // Use a raw response approach to bypass deep type instantiation
      const gameIdResponseRaw = await supabase
        .from('matches')
        .select('*')
        .eq('gameid', matchId)
        .maybeSingle();
      
      // Explicitly type the response parts to avoid deep inference
      const gameIdData = gameIdResponseRaw.data as RawDatabaseMatch | null;
      const gameIdError = gameIdResponseRaw.error;
      
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
      
      // Use direct type casting with a simple casting chain
      return adaptMatchFromDatabase(gameIdData);
    }
    
    // Check if we have data from ID query
    if (!idData) {
      console.error(`No data found for match ${matchId}`);
      toast.error("Match not found");
      return null;
    }
    
    // Use direct type casting with a simple casting chain
    return adaptMatchFromDatabase(idData);
    
  } catch (error) {
    console.error(`Unexpected error in getMatchById(${matchId}):`, error);
    toast.error("Server error");
    return null;
  }
};
