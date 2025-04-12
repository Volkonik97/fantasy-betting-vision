
import { LeagueGameDataRow } from "../../../csv/types";
import { extractPicksAndBans } from "../picksAndBansExtractor";
import { extractGameData } from "../gameDataExtractor";
import { getOrCreateGame } from "../gameTracker";

/**
 * Process a single match from the raw data
 */
export function processMatch(row: LeagueGameDataRow) {
  if (!row.gameid) {
    console.warn("Skipping row without gameid:", row);
    return null;
  }

  // Get basic game data
  const gameId = row.gameid;
  const gameData = extractGameData(row);
  
  // Get picks and bans if available
  const picksAndBans = extractPicksAndBans(row);
  
  // Get or create game tracker
  const game = getOrCreateGame(gameId);
  
  // Update game data
  if (gameData.date) game.date = gameData.date;
  if (gameData.league) game.league = gameData.league;
  if (gameData.year) game.year = gameData.year;
  
  // Add row to game's rows
  if (!game.rows) game.rows = new Set();
  game.rows.add(row);
  
  return {
    gameId,
    gameData,
    picksAndBans,
    game
  };
}
