
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
 * Calculate average statistics from player match data
 */
export const calculateAverages = (matchStats: any[]): any => {
  if (!matchStats || matchStats.length === 0) {
    return null;
  }
  
  // Initialize counters
  let totalKills = 0;
  let totalDeaths = 0;
  let totalAssists = 0;
  let totalCs = 0;
  let totalDamageShare = 0;
  let totalGoldShare = 0;
  let totalVisionScore = 0;
  let winCount = 0;
  
  // Count matches with data for each stat to calculate correct averages
  let matchesWithDamageShare = 0;
  let matchesWithGoldShare = 0;
  let matchesWithVisionScore = 0;
  
  // Process each match
  for (const match of matchStats) {
    totalKills += match.kills || 0;
    totalDeaths += match.deaths || 0;
    totalAssists += match.assists || 0;
    
    // CS
    if (match.total_cs || match.minion_kills) {
      totalCs += match.total_cs || match.minion_kills || 0;
    }
    
    // Damage share
    if (match.damage_share) {
      totalDamageShare += match.damage_share;
      matchesWithDamageShare++;
    }
    
    // Gold share
    if (match.earned_gold_share) {
      totalGoldShare += match.earned_gold_share;
      matchesWithGoldShare++;
    }
    
    // Vision score
    if (match.vision_score) {
      totalVisionScore += match.vision_score;
      matchesWithVisionScore++;
    }
    
    // Check if match was a win - use improved detection
    if (isWinForPlayer(match)) {
      winCount++;
    }
  }
  
  // Calculate averages
  const games = matchStats.length;
  const kda = totalDeaths > 0 ? 
    ((totalKills + totalAssists) / totalDeaths).toFixed(2) : 
    ((totalKills + totalAssists)).toFixed(2);
  
  // Return calculated stats
  return {
    kills: totalKills / games,
    deaths: totalDeaths / games,
    assists: totalAssists / games,
    kda: parseFloat(kda),
    csPerMin: matchStats.reduce((sum, match) => sum + (match.cspm || 0), 0) / games,
    damageShare: matchesWithDamageShare > 0 ? totalDamageShare / matchesWithDamageShare : 0,
    goldShare: matchesWithGoldShare > 0 ? totalGoldShare / matchesWithGoldShare : 0,
    visionScore: matchesWithVisionScore > 0 ? totalVisionScore / matchesWithVisionScore : 0,
    games,
    wins: winCount,
    winRate: (winCount / games) * 100
  };
};

/**
 * Get champion statistics for a player
 */
export const getChampionStats = (matchStats: any[], playerTeamId?: string): any[] => {
  if (!matchStats || matchStats.length === 0) {
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
