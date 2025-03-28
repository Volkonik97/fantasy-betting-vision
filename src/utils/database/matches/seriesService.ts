
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if a match is part of a series by examining its ID
 * @param matchId The match ID to check
 * @returns True if the match is part of a series
 */
export const isSeriesMatch = (matchId: string): boolean => {
  return matchId.includes('_');
};

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
    const { data: seriesMatches, error } = await supabase
      .from('matches')
      .select('*')
      .like('id', `${baseMatchId}_%`);

    if (error) {
      console.error("Error fetching series matches:", error);
      return countOnly ? 0 : { blue: 0, red: 0 };
    }

    if (!seriesMatches || seriesMatches.length === 0) {
      console.log(`No series matches found for ${baseMatchId}`);
      return countOnly ? 0 : { blue: 0, red: 0 };
    }

    // Important: Check if this is really a series or just matches with similar IDs
    // Typically a series has a small number of matches (3, 5, 7)
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
    
    // Log the number of matches found
    console.log(`Found ${seriesMatches.length} matches in series ${baseMatchId}`);

    // If we only want the count, return the number of matches
    if (countOnly) {
      return seriesMatches.length;
    }

    // Otherwise, calculate the series score
    let blueWins = 0;
    let redWins = 0;

    seriesMatches.forEach(match => {
      // Log each match in the series to debug
      console.log(`Match in series: ${match.id}, winner: ${match.winner_team_id}, blueId: ${teamBlueId}, redId: ${teamRedId}`);
      
      if (match.winner_team_id === teamBlueId) {
        blueWins++;
      } else if (match.winner_team_id === teamRedId) {
        redWins++;
      }
    });

    console.log(`Series score calculated: Blue ${blueWins} - Red ${redWins}`);
    return { blue: blueWins, red: redWins };
  } catch (error) {
    console.error("Error calculating series score:", error);
    return countOnly ? 0 : { blue: 0, red: 0 };
  }
};

/**
 * Extract the game number from a match ID
 * @param matchId The match ID to extract the game number from
 * @returns The game number, or 1 if not found
 */
export const getGameNumberFromId = (matchId: string): number => {
  if (!isSeriesMatch(matchId)) return 1;
  
  const gameIdPart = matchId.split('_').pop();
  
  if (!gameIdPart) return 1;
  
  // Try to parse the game number, default to 1 if not a valid number
  const gameNumber = parseInt(gameIdPart, 10);
  return isNaN(gameNumber) ? 1 : gameNumber;
};

/**
 * Get the base match ID without the game number suffix
 * @param matchId The full match ID
 * @returns The base match ID
 */
export const getBaseMatchId = (matchId: string): string => {
  if (!isSeriesMatch(matchId)) return matchId;
  
  // Return everything before the last underscore
  return matchId.split('_').slice(0, -1).join('_');
};

/**
 * Determine if a match is part of a standard series (Bo3, Bo5, Bo7)
 * @param matchId The match ID to check
 * @returns Promise resolving to boolean indicating if it's a standard series
 */
export const isStandardSeries = async (matchId: string): Promise<boolean> => {
  if (!isSeriesMatch(matchId)) return false;
  
  const baseId = getBaseMatchId(matchId);
  const seriesLength = await getSeriesScore(baseId, '', '', true);
  
  if (typeof seriesLength === 'number') {
    // Standard series lengths are 3, 5, or 7
    return seriesLength === 3 || seriesLength === 5 || seriesLength === 7;
  }
  
  return false;
};
