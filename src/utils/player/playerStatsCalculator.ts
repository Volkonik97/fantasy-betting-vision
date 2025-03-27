
export interface PlayerAverageStats {
  kills: number;
  deaths: number;
  assists: number;
  kda: number;
  csPerMin: number;
  damageShare: number;
  visionScore: number;
  goldShare: number;
  games: number;
  wins: number;
  winRate: number;
}

export interface ChampionStat {
  champion: string;
  games: number;
  wins: number;
  kills: number;
  deaths: number;
  assists: number;
}

// Calculate win for a player in a specific match
export const isWinForPlayer = (stat: any, playerTeam?: string): boolean => {
  // Check if the stat indicates a win for this player
  if (stat.is_winner === true) {
    return true;
  }
  
  // Check if the team_id matches the winner_team_id
  if (stat.team_id && stat.winner_team_id && stat.team_id === stat.winner_team_id) {
    return true;
  }
  
  // Check if the team (player's team) matches the winner
  if (playerTeam && stat.winner === playerTeam) {
    return true;
  }
  
  return false;
};

// Calculate average stats
export const calculateAverages = (matchStats: any[]): PlayerAverageStats | null => {
  if (!matchStats || matchStats.length === 0) return null;
  
  // Calculate the total number of wins across all matches
  const totalWins = matchStats.reduce((count, stat) => count + (isWinForPlayer(stat) ? 1 : 0), 0);
  const winRate = matchStats.length > 0 ? (totalWins / matchStats.length) * 100 : 0;
  
  // Calculate total kills, deaths, and assists
  const totalKills = matchStats.reduce((sum, stat) => sum + (stat.kills || 0), 0);
  const totalDeaths = matchStats.reduce((sum, stat) => sum + (stat.deaths || 0), 0);
  const totalAssists = matchStats.reduce((sum, stat) => sum + (stat.assists || 0), 0);
  
  // Calculate KDA directly using totals, not averaging individual KDAs
  const kda = totalDeaths > 0 ? (totalKills + totalAssists) / totalDeaths : totalKills + totalAssists;
  
  return {
    kills: totalKills / matchStats.length,
    deaths: totalDeaths / matchStats.length,
    assists: totalAssists / matchStats.length,
    kda: kda, // This is now calculated from totals, not averaged
    csPerMin: matchStats.reduce((sum, stat) => sum + (stat.cspm || 0), 0) / matchStats.length,
    damageShare: matchStats.reduce((sum, stat) => sum + (stat.damage_share || 0), 0) / matchStats.length,
    visionScore: matchStats.reduce((sum, stat) => sum + (stat.vision_score || 0), 0) / matchStats.length,
    goldShare: matchStats.reduce((sum, stat) => sum + (stat.earned_gold_share || 0), 0) / matchStats.length,
    games: matchStats.length,
    wins: totalWins,
    winRate: winRate
  };
};

// Get champion statistics
export const getChampionStats = (matchStats: any[], playerTeam?: string): ChampionStat[] => {
  if (!matchStats || matchStats.length === 0) return [];
  
  const champStats: Record<string, ChampionStat> = {};
  
  matchStats.forEach(stat => {
    if (!stat.champion) return;
    
    if (!champStats[stat.champion]) {
      champStats[stat.champion] = {
        champion: stat.champion,
        games: 0,
        wins: 0,
        kills: 0,
        deaths: 0,
        assists: 0
      };
    }
    
    champStats[stat.champion].games += 1;
    
    // Use the optimized win check
    if (isWinForPlayer(stat, playerTeam)) {
      champStats[stat.champion].wins += 1;
    }
    
    champStats[stat.champion].kills += (stat.kills || 0);
    champStats[stat.champion].deaths += (stat.deaths || 0);
    champStats[stat.champion].assists += (stat.assists || 0);
  });
  
  return Object.values(champStats).sort((a, b) => b.games - a.games);
};
