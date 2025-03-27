
import { Team, Player, Match } from '../mockData';
import { hasDatabaseData, getLastDatabaseUpdate, clearDatabase } from './coreService';
import { getTeams, saveTeams } from './teamsService';
import { getSideStatistics } from './sideStatisticsService';
import { getPlayers, savePlayers } from './playersService';
import { getMatches, saveMatches } from './matches/matchesService';
import { getTournaments } from './tournamentsService';

// Save data to database
export const saveToDatabase = async (data: {
  teams: Team[];
  players: Player[];
  matches: Match[];
  tournaments?: any[];
}): Promise<boolean> => {
  try {
    console.log("Starting to save to Supabase:", {
      teamsCount: data.teams.length,
      playersCount: data.players.length,
      matchesCount: data.matches.length
    });
    
    // First clear the database
    await clearDatabase();
    
    // Insert teams
    const teamsSuccess = await saveTeams(data.teams);
    if (!teamsSuccess) return false;
    
    // Insert players
    const playersSuccess = await savePlayers(data.players);
    if (!playersSuccess) return false;
    
    // Insert matches
    const matchesSuccess = await saveMatches(data.matches);
    if (!matchesSuccess) return false;
    
    console.log("Data saved to Supabase successfully");
    return true;
  } catch (error) {
    console.error("Error saving data:", error);
    return false;
  }
};

// Export all functions
export {
  hasDatabaseData,
  getLastDatabaseUpdate,
  clearDatabase,
  getTeams,
  getPlayers,
  getMatches,
  getTournaments,
  getSideStatistics
};
