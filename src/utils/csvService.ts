
// This file now serves as a centralized export point for all CSV-related services
// Import and re-export all the functions from the individual service files

import { parseCSVFile, parseCSVFromURL, extractSheetId, getGSheetCSVUrl } from './csvParser';
import { convertTeamData, convertPlayerData, convertMatchData, chunk } from './dataConverter';
import { loadFromGoogleSheets, loadFromSingleGoogleSheet } from './googleSheetsService';
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
  getSideStatistics
} from './databaseService';
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
} from './csvTypes';

// Re-export types
export type { TeamCSV, PlayerCSV, MatchCSV, LeagueGameDataRow } from './csvTypes';

// Function to load CSV files
export const loadCsvData = async (
  teamFile: File,
  playerFile: File, 
  matchFile: File
) => {
  try {
    const teamResults = await parseCSVFile(teamFile);
    const playerResults = await parseCSVFile(playerFile);
    const matchResults = await parseCSVFile(matchFile);
    
    console.log("Données CSV chargées:", {
      teams: teamResults.data.length,
      players: playerResults.data.length,
      matches: matchResults.data.length
    });
    
    const teams = convertTeamData(teamResults.data as any);
    const players = convertPlayerData(playerResults.data as any);
    const matches = convertMatchData(matchResults.data as any, teams);
    
    console.log("Données converties:", {
      teams: teams.length,
      players: players.length,
      matches: matches.length
    });
    
    teams.forEach(team => {
      team.players = players.filter(player => player.team === team.id);
    });
    
    await saveToDatabase({ teams, players, matches });
    
    return { teams, players, matches };
  } catch (error) {
    console.error('Erreur lors du chargement des données CSV:', error);
    throw error;
  }
};

// Re-export everything for backward compatibility
export {
  parseCSVFile,
  parseCSVFromURL,
  extractSheetId,
  getGSheetCSVUrl,
  convertTeamData,
  convertPlayerData,
  convertMatchData,
  chunk,
  processLeagueData,
  loadFromGoogleSheets,
  loadFromSingleGoogleSheet,
  hasDatabaseData,
  getLastDatabaseUpdate,
  clearDatabase,
  saveToDatabase,
  getTeams,
  getPlayers,
  getMatches,
  getTournaments,
  getSideStatistics,
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
