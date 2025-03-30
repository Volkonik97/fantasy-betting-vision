
import { LeagueGameDataRow } from '../../csv/types';
import { GameTracker, MatchTeamStats, PlayerMatchStats } from '../types';
import { ProcessedGameData } from './types';
import { groupGamesByGameId } from './gameDataExtractor';
import { initializeGameTracker, identifyTeamSides, identifyGameResult } from './gameTracker';
import { extractTeamStats } from './teamStatsExtractor';
import { extractPlayerStats } from './playerStatsExtractor';
import { convertToMatchCsv } from './matchCsvConverter';
import { extractPicksAndBans } from './picksAndBansExtractor';

/**
 * Process match data from League data rows with improved efficiency
 */
export function processMatchData(data: LeagueGameDataRow[]): ProcessedGameData {
  console.log(`Processing ${data.length} rows of match data...`);
  
  // Create maps for tracking game/match data
  const uniqueGames = new Map<string, GameTracker>();
  const matchStats = new Map<string, Map<string, MatchTeamStats>>();
  const matchPlayerStats = new Map<string, Map<string, PlayerMatchStats>>();
  
  // Group data by game ID for batch processing
  const gameIdGroups = groupGamesByGameId(data);
  
  console.log(`Found ${gameIdGroups.size} unique games to process`);
  
  // Process each game with all its rows at once
  gameIdGroups.forEach((gameRows, gameId) => {
    // Initialize game data
    let game = initializeGameTracker(gameId, gameRows[0]);
    
    // Identify teams and their sides
    const { updatedGame } = identifyTeamSides(game, gameRows);
    game = updatedGame;
    
    // Identify game result
    game = identifyGameResult(game, gameRows);
    
    // Extract team statistics
    const teamStatsMap = extractTeamStats(gameId, gameRows);
    
    // Extract player statistics
    const playerStatsMap = extractPlayerStats(gameId, gameRows);
    
    // Add the complete game data to our maps
    uniqueGames.set(gameId, game);
    matchStats.set(gameId, teamStatsMap);
    matchPlayerStats.set(gameId, playerStatsMap);
  });
  
  // Convert the maps to arrays for the return object
  const matchesArray = Array.from(uniqueGames.values()).map(match => {
    return convertToMatchCsv(match, matchStats);
  });
  
  console.log(`Processed ${uniqueGames.size} matches, ${matchPlayerStats.size} player stats groups`);
  
  return {
    uniqueGames,
    matchStats,
    matchPlayerStats,
    matchesArray
  };
}

// Re-export the function with its original signature for backward compatibility
export { processMatchData as default };
