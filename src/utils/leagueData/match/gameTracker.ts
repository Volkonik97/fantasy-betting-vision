import { LeagueGameDataRow } from '../../csv/types';
import { GameTracker } from '../types';

// Keep track of games we've seen
const gamesMap = new Map<string, GameTracker>();

/**
 * Get or create a game tracker for a specific game ID
 */
export function getOrCreateGame(gameId: string): GameTracker {
  // Check if we already have this game
  let game = gamesMap.get(gameId);
  
  // If not, create a new game tracker
  if (!game) {
    game = {
      id: gameId,
      teams: {
        blue: '',
        red: ''
      }
    };
    gamesMap.set(gameId, game);
  }
  
  return game;
}

/**
 * Initialize a game tracker object
 */
export function initializeGameTracker(gameId: string, firstRow: LeagueGameDataRow): GameTracker {
  return {
    id: gameId,
    date: firstRow.date || '',
    league: firstRow.league || '',
    year: firstRow.year || '',
    split: firstRow.split || '',
    patch: firstRow.patch || '',
    playoffs: firstRow.playoffs === 'TRUE' || firstRow.playoffs === 'true',
    teams: {
      blue: '',
      red: ''
    },
    rows: new Set()  // Add this to store all rows for this game
  };
}

/**
 * Identify teams and their sides
 */
export function identifyTeamSides(game: GameTracker, rows: LeagueGameDataRow[]): { updatedGame: GameTracker } {
  const updatedGame = { ...game };
  
  // Store all rows in the game object for later use with picks/bans
  rows.forEach(row => {
    if (updatedGame.rows instanceof Set) {
      updatedGame.rows.add(row);
    }
  });
  
  // Find blue and red team rows
  const blueTeamRow = rows.find(row => 
    (row.side && row.side.toLowerCase() === 'blue') || 
    (row.teamposition && row.teamposition.toLowerCase() === 'blue')
  );
  
  const redTeamRow = rows.find(row => 
    (row.side && row.side.toLowerCase() === 'red') || 
    (row.teamposition && row.teamposition.toLowerCase() === 'red')
  );
  
  // Extract team IDs
  if (blueTeamRow && blueTeamRow.teamid) {
    updatedGame.teams.blue = blueTeamRow.teamid;
  }
  
  if (redTeamRow && redTeamRow.teamid) {
    updatedGame.teams.red = redTeamRow.teamid;
  }
  
  // If we couldn't find teams by side, try to extract from the first row
  if (!updatedGame.teams.blue && !updatedGame.teams.red && rows.length > 0) {
    // Sometimes the data is structured with team1 and team2
    if (rows[0].teamid) {
      const teamIds = rows
        .map(row => row.teamid)
        .filter((value, index, self) => value && self.indexOf(value) === index);
      
      if (teamIds.length >= 2) {
        updatedGame.teams.blue = teamIds[0] || '';
        updatedGame.teams.red = teamIds[1] || '';
      }
    }
  }
  
  return { updatedGame };
}

/**
 * Identify the game result
 */
export function identifyGameResult(game: GameTracker, rows: LeagueGameDataRow[]): GameTracker {
  const updatedGame = { ...game };
  
  // Find a row with result data
  const resultRow = rows.find(row => row.result === '1' || row.result === 'TRUE' || row.result === 'true');
  
  if (resultRow && resultRow.teamid) {
    updatedGame.result = {
      winner: resultRow.teamid,
      duration: resultRow.gamelength || ''
    };
  }
  
  return updatedGame;
}
