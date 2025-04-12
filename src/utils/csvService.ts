
// This file now serves as a centralized export point for all CSV-related services
// Import and re-export all the functions from the individual service files

import { parseCSVFromURL, extractSheetId, getGSheetCSVUrl } from './csvParser';
import { convertTeamData, convertPlayerData, convertMatchData, chunk } from './dataConverter';
import { loadFromGoogleSheets } from './googleSheetsService';
import { processLeagueData } from './leagueDataProcessor';
import { 
  hasDatabaseData, 
  getLastDatabaseUpdate, 
  clearDatabase, 
  saveToDatabase,
  getTeams,
  getPlayers,
  getMatches,
  getTournaments,
} from './database/databaseService';
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
import { getPlayerMatchStats, getPlayerStats } from './database/matchesService'; 
import { getSideStatistics } from './statistics';

// Re-export types
export type { TeamCSV, PlayerCSV, MatchCSV, LeagueGameDataRow } from './csv/types';

// Re-export everything for backward compatibility
export {
  parseCSVFromURL,
  extractSheetId,
  getGSheetCSVUrl,
  convertTeamData,
  convertPlayerData,
  convertMatchData,
  chunk,
  processLeagueData,
  loadFromGoogleSheets,
  hasDatabaseData,
  getLastDatabaseUpdate,
  clearDatabase,
  saveToDatabase,
  getTeams,
  getPlayers,
  getMatches,
  getTournaments,
  getSideStatistics,
  getPlayerMatchStats,
  getPlayerStats,
  // Export the getter/setter functions
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
