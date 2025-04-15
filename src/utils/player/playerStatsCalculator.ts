
// Utility functions for calculating player statistics from match data

/**
 * Determines if a match was a win for the player
 */
export const isWinForPlayer = (playerStat: any, playerTeamId?: string): boolean => {
  // If we have the playerTeamId explicitly passed, use it
  const teamId = playerTeamId || playerStat.team_id;
  
  // Check if there's match result data
  if (!playerStat.match_id) {
    return false;
  }
  
  // Directly use side and match winner for more reliable results
  const playerSide = playerStat.side?.toLowerCase();
  
  // For backward compatibility, try to determine the result from multiple sources
  // 1. Check direct win field if available - THIS IS THE MOST RELIABLE SOURCE
  if (typeof playerStat.is_winner === 'boolean') {
    return playerStat.is_winner;
  }
  
  // 2. If we know the winner team ID and the player's team ID
  if (playerStat.winner_team_id && teamId) {
    return playerStat.winner_team_id === teamId;
  }
  
  // 3. Try to determine from side and blue/red win
  if (playerSide === 'blue' && playerStat.blue_team_win === true) {
    return true;
  }
  if (playerSide === 'red' && playerStat.blue_team_win === false) {
    return true;
  }
  
  // Default to false if we can't determine
  return false;
};

/**
 * Get champion statistics for a player
 */
export const getChampionStats = (matchStats: any[] | null | undefined, playerTeamId?: string): any[] => {
  // Check if matchStats is valid
  if (!matchStats || !Array.isArray(matchStats) || matchStats.length === 0) {
    console.log("No valid match stats data to calculate champion stats");
    return [];
  }
  
  const champStats: { [key: string]: any } = {};
  
  // Group stats by champion
  for (const match of matchStats) {
    const champion = match.champion;
    if (!champion) continue;
    
    if (!champStats[champion]) {
      champStats[champion] = {
        champion,
        games: 0,
        wins: 0,
        kills: 0,
        deaths: 0,
        assists: 0,
      };
    }
    
    // Update stats
    champStats[champion].games += 1;
    champStats[champion].kills += match.kills || 0;
    champStats[champion].deaths += match.deaths || 0;
    champStats[champion].assists += match.assists || 0;
    
    // Use improved win detection
    if (isWinForPlayer(match, playerTeamId)) {
      champStats[champion].wins += 1;
    }
  }
  
  // Convert to array and calculate averages
  return Object.values(champStats).map(champ => ({
    ...champ,
    winRate: champ.games > 0 ? (champ.wins / champ.games) * 100 : 0,
    kda: champ.deaths > 0 ? 
      ((champ.kills + champ.assists) / champ.deaths).toFixed(2) : 
      ((champ.kills + champ.assists)).toFixed(2)
  })).sort((a, b) => b.games - a.games);
};
