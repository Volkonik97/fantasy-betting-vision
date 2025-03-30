
/**
 * Build player match stats array from player stats map
 */
export function buildPlayerMatchStatsArray(
  playerMatchStats: Map<string, Map<string, any>>
): any[] {
  const playerMatchStatsArray: any[] = [];
  
  playerMatchStats.forEach((playerMap, matchId) => {
    playerMap.forEach((stats, playerId) => {
      playerMatchStatsArray.push({
        ...stats,
        participant_id: `${playerId}_${matchId}`,
        player_id: playerId,
        match_id: matchId
      });
    });
  });
  
  return playerMatchStatsArray;
}
