
// This file now serves as a centralized export point for all CSV-related services
// Import and re-export all the functions from the individual service files

import { parseCSVFromURL, extractSheetId, getGSheetCSVUrl } from './csvParser';
import { convertTeamData, convertPlayerData, convertMatchData, chunk } from './dataConverter';
import { loadFromGoogleSheets } from './googleSheetsService';
import { processLeagueData } from './leagueDataProcessor';
import { getSideStatistics } from './statistics';

// Import from database-related services
import { 
  hasDatabaseData, 
  getLastDatabaseUpdate, 
  clearDatabase, 
  saveToDatabase
} from './database/databaseService';

import { getTeams, clearTeamsCache } from './database/teams/teamsService';
import { getPlayers } from './database/playersService';
import { getMatches, getPlayerMatchStats, getPlayerStats } from './database/matchesService';
import { getTournaments } from './database/tournamentsService';

// Import from cache
import { 
  getLoadedTeams,
  getLoadedPlayers,
  getLoadedMatches,
  getLoadedTournaments,
  setLoadedTeams,
  setLoadedPlayers,
  setLoadedMatches,
  setLoadedTournaments,
  resetCache
} from './csv/cache/dataCache';

// Re-export types
export type { TeamCSV, PlayerCSV, MatchCSV, LeagueGameDataRow } from './csv/types';

// Re-export everything for backward compatibility
export {
  // CSV parsing and conversion
  parseCSVFromURL,
  extractSheetId,
  getGSheetCSVUrl,
  convertTeamData,
  convertPlayerData,
  convertMatchData,
  chunk,
  processLeagueData,
  loadFromGoogleSheets,
  
  // Database operations
  hasDatabaseData,
  getLastDatabaseUpdate,
  clearDatabase,
  saveToDatabase,
  
  // Data retrieval functions
  getTeams,
  clearTeamsCache,
  getPlayers,
  getMatches,
  getTournaments,
  getSideStatistics,
  getPlayerMatchStats,
  getPlayerStats,
  
  // Cache management functions
  getLoadedTeams,
  getLoadedPlayers,
  getLoadedMatches,
  getLoadedTournaments,
  setLoadedTeams,
  setLoadedPlayers,
  setLoadedMatches,
  setLoadedTournaments,
  resetCache
};
