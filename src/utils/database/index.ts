
// Re-export all database services for easier imports
import { getPlayers, getPlayerById, savePlayers } from './players/playersService';
import { getTeams, getTeamById, saveTeams, clearTeamsCache } from './teams';
import { executeSQL, checkTableExists } from './setupDb';

export {
  // Player services
  getPlayers,
  getPlayerById,
  savePlayers,
  
  // Team services
  getTeams,
  getTeamById,
  saveTeams,
  clearTeamsCache,
  
  // Database setup utilities
  executeSQL,
  checkTableExists
};
