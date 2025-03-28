
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
