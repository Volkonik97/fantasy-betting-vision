
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
  const { picks: picksData, bans: bansData } = extractPicksAndBans([row]);
  
  // Get or create game tracker
  const game = getOrCreateGame(gameId);
  
  // Update game data
  if (gameData.date) game.date = gameData.date;
  if (gameData.league) game.league = gameData.league;
  if (gameData.year) game.year = gameData.year.toString();
  if (gameData.split) game.split = gameData.split;
  if (gameData.patch) game.patch = gameData.patch;
  
  // Add row to game's rows
  if (!game.rows) game.rows = new Set();
  game.rows.add(row);
  
  return {
    gameId,
    gameData,
    picksAndBans: { picks: picksData, bans: bansData },
    game
  };
}

/**
 * Process all match data from a dataset
 */
export function processMatchData(data: LeagueGameDataRow[]) {
  console.log(`Processing match data from ${data.length} rows...`);
  
  // Track unique games
  const uniqueGames = new Map();
  
  // Track match stats
  const matchStats = new Map();
  
  // Track player stats
  const matchPlayerStats = new Map();
  
  // Track processed matches
  const matchesArray: any[] = [];
  
  // Process each row
  data.forEach(row => {
    const result = processMatch(row);
    if (result) {
      const { gameId, game } = result;
      
      // Track unique games
      uniqueGames.set(gameId, game);
      
      // Add to matches array if not already there
      if (!matchesArray.find(m => m.id === gameId)) {
        matchesArray.push({
          id: gameId,
          date: game.date,
          league: game.league,
          year: game.year,
          teamBlueId: game.teams.blue,
          teamRedId: game.teams.red
        });
      }
    }
  });
  
  console.log(`Processed ${uniqueGames.size} unique games`);
  
  return {
    uniqueGames,
    matchStats,
    matchPlayerStats,
    matchesArray
  };
}
