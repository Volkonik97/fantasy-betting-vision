
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
