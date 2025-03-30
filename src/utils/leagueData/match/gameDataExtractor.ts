
import { LeagueGameDataRow } from '../../csvTypes';

/**
 * Groups game data by game ID for more efficient processing
 */
export function groupGamesByGameId(data: LeagueGameDataRow[]): Map<string, LeagueGameDataRow[]> {
  const gameIdGroups = new Map<string, LeagueGameDataRow[]>();
  
  // Group data by game ID for batch processing
  data.forEach(row => {
    if (!row.gameid) return;
    
    if (!gameIdGroups.has(row.gameid)) {
      gameIdGroups.set(row.gameid, []);
    }
    
    gameIdGroups.get(row.gameid)!.push(row);
  });
  
  return gameIdGroups;
}
