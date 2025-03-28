import { supabase } from "@/integrations/supabase/client";
import { fetchSeriesMatches, isStandardSeriesLength, determineSeriesLength, calculateSeriesScore } from "./seriesScoreUtils";

/**
 * Get series score information for matches in the same series
 * @param baseMatchId Base match ID (without game number suffix)
 * @param teamBlueId Team blue ID (optional)
 * @param teamRedId Team red ID (optional)
 * @param countOnly If true, only return the count of matches in the series
 * @returns Series score information or match count
 */
export const getSeriesScore = async (
  baseMatchId: string,
  teamBlueId?: string,
  teamRedId?: string,
  countOnly: boolean = false
): Promise<{ blue: number, red: number } | number | null> => {
  try {
    // Log the parameters for debugging
    console.log(`Getting series score for ${baseMatchId}, teamBlue: ${teamBlueId}, teamRed: ${teamRedId}, countOnly: ${countOnly}`);
    
    // Get all matches in the series
    const seriesMatches = await fetchSeriesMatches(baseMatchId);

    if (!seriesMatches || seriesMatches.length === 0) {
      console.log(`No series matches found for ${baseMatchId}`);
      return countOnly ? 0 : { blue: 0, red: 0 };
    }

    // Important: Check if this is really a series or just matches with similar IDs
    const maxSeriesLength = 7; // Maximum reasonable Bo7 series
    
    if (seriesMatches.length > maxSeriesLength) {
      console.log(`Too many matches found (${seriesMatches.length}) for series ${baseMatchId}, likely not a valid series`);
      
      // If countOnly is true, return a reasonable max value (typically 3 or 5 for Bo3/Bo5)
      if (countOnly) {
        // Default to Bo3 if we're not sure
        return 3;
      }
      
      return { blue: 0, red: 0 };
    }
    
    // If there's only one match with this pattern, it's a BO1, not a series
    if (seriesMatches.length === 1) {
      console.log(`Only one match found for ${baseMatchId}, this is a BO1 not a series`);
      return countOnly ? 1 : { blue: 0, red: 0 };
    }
    
    // Log the number of matches found
    console.log(`Found ${seriesMatches.length} matches in series ${baseMatchId}`);

    // If we only want the count, determine the series length
    if (countOnly) {
      return determineSeriesLength(seriesMatches.length);
    }

    // Otherwise, calculate the series score
    return calculateSeriesScore(seriesMatches, teamBlueId, teamRedId);
  } catch (error) {
    console.error("Error calculating series score:", error);
    return countOnly ? 0 : { blue: 0, red: 0 };
  }
};
