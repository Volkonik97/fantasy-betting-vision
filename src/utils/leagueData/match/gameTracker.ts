
import { GameTracker } from '../types';
import { LeagueGameDataRow } from '../../csv/types';
import { parseBoolean } from '../types';

/**
 * Initialize game tracker from the first row of game data
 */
export function initializeGameTracker(gameId: string, firstRow: LeagueGameDataRow): GameTracker {
  return {
    id: gameId,
    date: firstRow.date || new Date().toISOString(),
    league: firstRow.league || '',
    year: firstRow.year || '',
    split: firstRow.split || '',
    patch: firstRow.patch || '',
    playoffs: parseBoolean(firstRow.playoffs),
    teams: { blue: '', red: '' },
    result: undefined,
    duration: firstRow.gamelength,
  };
}

/**
 * Identify team sides (blue/red) from game data
 */
export function identifyTeamSides(game: GameTracker, gameRows: LeagueGameDataRow[]): { 
  updatedGame: GameTracker, 
  blueTeamId: string, 
  redTeamId: string 
} {
  let blueTeamId = '';
  let redTeamId = '';
  
  // First pass - identify teams and their sides
  gameRows.forEach(row => {
    if (row.side && row.side.toLowerCase() === 'blue' && row.teamid) {
      game.teams.blue = row.teamid;
      blueTeamId = row.teamid;
    } else if (row.side && row.side.toLowerCase() === 'red' && row.teamid) {
      game.teams.red = row.teamid;
      redTeamId = row.teamid;
    }
  });
  
  return { updatedGame: game, blueTeamId, redTeamId };
}

/**
 * Identify game result from the rows
 */
export function identifyGameResult(game: GameTracker, gameRows: LeagueGameDataRow[]): GameTracker {
  const updatedGame = { ...game };
  
  // Find the winning team
  gameRows.forEach(row => {
    // Track game result
    if (row.result === '1' && row.teamid) {
      updatedGame.result = row.teamid;
    }
  });
  
  return updatedGame;
}
