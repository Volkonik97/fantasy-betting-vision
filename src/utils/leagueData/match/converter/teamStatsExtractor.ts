
import { GameTracker } from '../../types';

/**
 * Extract team statistics from match stats
 */
export function extractTeamStatistics(
  game: GameTracker, 
  matchStats: Map<string, Map<string, any>>
): { 
  teamBlueStats: any | undefined; 
  teamRedStats: any | undefined; 
} {
  // Get team stats if available
  const teamStats = matchStats.get(game.id);
  let teamBlueStats, teamRedStats;
  
  if (teamStats) {
    teamBlueStats = teamStats.get(game.teams.blue);
    teamRedStats = teamStats.get(game.teams.red);
    
    // Log stats to debug
    console.log(`Match ${game.id} stats:`, { 
      hasBlueTeamStats: !!teamBlueStats, 
      hasRedTeamStats: !!teamRedStats 
    });
  }

  return { teamBlueStats, teamRedStats };
}
