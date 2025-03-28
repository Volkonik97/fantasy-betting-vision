
import { getMatches } from './getMatches';

/**
 * Get aggregated score for a series of matches between two teams
 * @param baseMatchId The base match ID without the game number
 * @param blueTeamId The blue team ID
 * @param redTeamId The red team ID
 * @param countOnly If true, only return the number of matches in the series
 * @returns Aggregated scores or match count
 */
export const getSeriesScore = async (
  baseMatchId: string, 
  blueTeamId: string, 
  redTeamId: string,
  countOnly: boolean = false
): Promise<{blue: number, red: number} | number | null> => {
  try {
    console.log(`Getting series score for base match ID: ${baseMatchId}`);
    
    // Get all matches
    const allMatches = await getMatches();
    
    // Filter matches in this series
    const seriesMatches = allMatches.filter(match => {
      // Match should start with the base match ID
      const matchesBaseId = match.id.startsWith(baseMatchId);
      
      // Match should be completed
      const isCompleted = match.status === "Completed";
      
      // Match should be between the same teams (in any side)
      const sameTeams = (
        (match.teamBlue.id === blueTeamId && match.teamRed.id === redTeamId) ||
        (match.teamBlue.id === redTeamId && match.teamRed.id === blueTeamId)
      );
      
      // If team IDs were not provided, just check the base ID and status
      const matchCondition = blueTeamId && redTeamId ? matchesBaseId && isCompleted && sameTeams : matchesBaseId && isCompleted;
      
      return matchCondition;
    });
    
    console.log(`Found ${seriesMatches.length} matches in series ${baseMatchId}`);
    
    if (countOnly) {
      return seriesMatches.length;
    }
    
    if (seriesMatches.length <= 1) {
      // If only one match or no matches, return null to use individual scores
      return null;
    }
    
    // Calculate aggregated scores
    let blueWins = 0;
    let redWins = 0;
    
    seriesMatches.forEach(match => {
      if (match.result) {
        if (match.result.winner === blueTeamId) {
          blueWins++;
        } else if (match.result.winner === redTeamId) {
          redWins++;
        }
      }
    });
    
    console.log(`Series ${baseMatchId}: Blue team wins: ${blueWins}, Red team wins: ${redWins}`);
    
    return { blue: blueWins, red: redWins };
  } catch (error) {
    console.error('Error getting series score:', error);
    return null;
  }
};

/**
 * Check if a match is part of a series
 * @param matchId The match ID
 * @returns True if match is part of a series
 */
export const isSeriesMatch = async (matchId: string): Promise<boolean> => {
  // Extract base match ID
  const baseMatchId = matchId.split('_').slice(0, -1).join('_');
  
  // Get all matches
  const allMatches = await getMatches();
  
  // Count matches with the same base ID
  const matchesInSeries = allMatches.filter(match => 
    match.id.startsWith(baseMatchId)
  ).length;
  
  return matchesInSeries > 1;
};
