
import { LeagueGameDataRow } from '../../csv/types';

/**
 * Group game data rows by game ID
 */
export function groupGamesByGameId(data: LeagueGameDataRow[]): Map<string, LeagueGameDataRow[]> {
  const gameIdGroups = new Map<string, LeagueGameDataRow[]>();
  
  data.forEach(row => {
    if (!row.gameid) {
      return; // Skip rows without game ID
    }
    
    const gameId = row.gameid;
    const existingRows = gameIdGroups.get(gameId) || [];
    existingRows.push(row);
    gameIdGroups.set(gameId, existingRows);
  });
  
  return gameIdGroups;
}

/**
 * Group rows into specific game groups with identified ID
 */
export interface GameGroup {
  gameId: string;
  rows: LeagueGameDataRow[];
}

export function extractGameGroups(data: LeagueGameDataRow[]): GameGroup[] {
  const gameIdGroups = groupGamesByGameId(data);
  
  return Array.from(gameIdGroups.entries()).map(([gameId, rows]) => ({
    gameId,
    rows
  }));
}
