
import { supabase } from "@/integrations/supabase/client";
import { getGameNumberFromId } from "./seriesIdentification";
import { calculateSeriesScore } from "./seriesScoreUtils";

/**
 * Get series score up to a specific game number
 * @param baseMatchId Base match ID (without game number suffix)
 * @param currentGameNumber The current game number in the series
 * @param teamBlueId Team blue ID
 * @param teamRedId Team red ID
 * @returns Score up to the current game (exclusive of the current game)
 */
export const getSeriesScoreUpToGame = async (
  baseMatchId: string,
  currentGameNumber: number,
  teamBlueId?: string,
  teamRedId?: string
): Promise<{ blue: number, red: number }> => {
  try {
    console.log(`Getting series score up to game ${currentGameNumber} for series ${baseMatchId}`);
    
    // Get all matches in the series up to but not including the current game
    const { data: previousMatches, error } = await supabase
      .from('matches')
      .select('*')
      .like('id', `${baseMatchId}_%`)
      .order('id', { ascending: true });

    if (error) {
      console.error("Error fetching previous matches in series:", error);
      return { blue: 0, red: 0 };
    }

    if (!previousMatches || previousMatches.length === 0) {
      console.log(`No previous matches found for series ${baseMatchId}`);
      return { blue: 0, red: 0 };
    }
    
    // If there's only one match, it's a BO1, not a series
    if (previousMatches.length === 1) {
      console.log(`Only one match found for ${baseMatchId}, this is a BO1 not a series`);
      return { blue: 0, red: 0 };
    }

    // Filter matches that come before the current game
    const matchesBeforeCurrent = previousMatches.filter(match => {
      const gameNumber = getGameNumberFromId(match.id);
      return gameNumber < currentGameNumber;
    });

    console.log(`Found ${matchesBeforeCurrent.length} matches before game ${currentGameNumber}`);
    
    // Calculate the score based on previous matches
    return calculateSeriesScore(matchesBeforeCurrent, teamBlueId, teamRedId);
  } catch (error) {
    console.error("Error calculating previous series score:", error);
    return { blue: 0, red: 0 };
  }
};
