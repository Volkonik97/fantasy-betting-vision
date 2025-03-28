
import { supabase } from "@/integrations/supabase/client";

/**
 * Utility function to validate if a series length is standard (Bo3, Bo5, Bo7)
 * @param matchCount Number of matches found in the series
 * @returns Boolean indicating if this is a standard series
 */
export const isStandardSeriesLength = (matchCount: number): boolean => {
  // Standard series lengths are 3, 5, 7 matches
  const standardSeriesLengths = [3, 5, 7];
  return matchCount >= 2 && matchCount <= 7;
};

/**
 * Determine the standard series length (Bo3, Bo5, Bo7) based on match count
 * @param matchCount Number of matches found in the series
 * @returns The standard series length (3, 5, or 7)
 */
export const determineSeriesLength = (matchCount: number): number => {
  if (matchCount <= 3) return 3; // Bo3
  if (matchCount <= 5) return 5; // Bo5
  return 7; // Bo7
};

/**
 * Get all matches in a series from Supabase
 * @param baseMatchId Base match ID (without game number suffix)
 * @returns Array of series matches or empty array if error
 */
export const fetchSeriesMatches = async (baseMatchId: string) => {
  try {
    const { data: seriesMatches, error } = await supabase
      .from('matches')
      .select('*')
      .like('id', `${baseMatchId}_%`)
      .order('id', { ascending: true });
      
    if (error) {
      console.error("Error fetching series matches:", error);
      return [];
    }
    
    return seriesMatches || [];
  } catch (error) {
    console.error("Error fetching series matches:", error);
    return [];
  }
};

/**
 * Calculate the series score based on match results
 * @param seriesMatches Array of matches in the series
 * @param teamBlueId Team blue ID
 * @param teamRedId Team red ID
 * @returns Object with blue and red win counts
 */
export const calculateSeriesScore = (
  seriesMatches: any[],
  teamBlueId?: string,
  teamRedId?: string
): { blue: number, red: number } => {
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
};
