
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
      .like('id', `${baseMatchId}_%`)
      .order('id', { ascending: true });

    if (error) {
      console.error("Error fetching series matches:", error);
      return countOnly ? 0 : { blue: 0, red: 0 };
    }

    if (!seriesMatches || seriesMatches.length === 0) {
      console.log(`No series matches found for ${baseMatchId}`);
      return countOnly ? 0 : { blue: 0, red: 0 };
    }

    // Important: Check if this is really a series or just matches with similar IDs
    // Standard series lengths are 3, 5, 7 matches
    const standardSeriesLengths = [3, 5, 7];
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
      // For Bo3, Bo5, Bo7 determination based on actual or potential match count
      // Look for the nearest standard series length
      if (seriesMatches.length <= 2) return 3; // Bo3
      if (seriesMatches.length <= 3) return 3; // Bo3
      if (seriesMatches.length <= 5) return 5; // Bo5
      return 7; // Bo7
    }

    // Otherwise, calculate the series score
    let blueWins = 0;
    let redWins = 0;

    seriesMatches.forEach(match => {
      if (!match.winner_team_id) {
        console.log(`Match ${match.id} has no winner_team_id`);
        return;
      }

      // Debug: Log individual match scores
      console.log(`Match ${match.id} - score_blue: ${match.score_blue}, score_red: ${match.score_red}, winner: ${match.winner_team_id}`);
      
      if (match.winner_team_id === teamBlueId) {
        blueWins++;
      } else if (match.winner_team_id === teamRedId) {
        redWins++;
      } else {
        console.log(`Winner team ID ${match.winner_team_id} doesn't match either blue (${teamBlueId}) or red (${teamRedId})`);
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
    let blueWins = 0;
    let redWins = 0;

    matchesBeforeCurrent.forEach(match => {
      if (!match.winner_team_id) {
        console.log(`Match ${match.id} has no winner_team_id`);
        return;
      }

      // Debug: Log individual match scores
      console.log(`Previous match ${match.id} - winner: ${match.winner_team_id}`);
      
      if (match.winner_team_id === teamBlueId) {
        blueWins++;
      } else if (match.winner_team_id === teamRedId) {
        redWins++;
      } else {
        console.log(`Winner team ID ${match.winner_team_id} doesn't match either blue (${teamBlueId}) or red (${teamRedId})`);
      }
    });

    console.log(`Series score up to game ${currentGameNumber}: Blue ${blueWins} - Red ${redWins}`);
    return { blue: blueWins, red: redWins };
  } catch (error) {
    console.error("Error calculating previous series score:", error);
    return { blue: 0, red: 0 };
  }
};

/**
 * Extract the game number from a match ID
 * @param matchId The match ID to extract the game number from
 * @returns The game number, or 1 if not found
 */
export const getGameNumberFromId = (matchId: string): number => {
  if (!isSeriesMatch(matchId)) return 1;
  
  const parts = matchId.split('_');
  const gameIdPart = parts[parts.length - 1];
  
  if (!gameIdPart) return 1;
  
  // Try to parse the game number, default to 1 if not a valid number
  const gameNumber = parseInt(gameIdPart, 10);
  
  // Make sure the game number is reasonable (between 1 and 7)
  // Games in a series are typically numbered 1, 2, 3, etc.
  if (isNaN(gameNumber) || gameNumber < 1 || gameNumber > 7) {
    // If the parsed value is unreasonable, try to determine the game number
    // by position in the series sequence
    console.log(`Invalid game number ${gameNumber} extracted from ${matchId}, using position-based approach`);
    return (parts.length > 1) ? parts.length : 1;
  }
  
  return gameNumber;
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
  
  // Query to count similar matches to determine if it's a real series
  const { data: matches, error } = await supabase
    .from('matches')
    .select('id')
    .like('id', `${baseId}_%`);
    
  if (error || !matches) {
    console.error("Error checking if match is part of standard series:", error);
    return false;
  }
  
  // If there's only one match with this pattern, it's a BO1, not a series
  if (matches.length === 1) {
    console.log(`Only one match found for ${baseId}, this is a BO1 not a series`);
    return false;
  }
  
  const seriesLength = matches.length;
  
  // Standard series lengths are 3, 5, or 7
  const isStandard = seriesLength >= 2 && seriesLength <= 7;
  console.log(`Match ${matchId} is part of a ${isStandard ? 'standard' : 'non-standard'} series with ${seriesLength} games`);
  
  return isStandard;
};
