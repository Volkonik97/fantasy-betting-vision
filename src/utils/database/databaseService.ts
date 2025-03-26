
import { Team, Player, Match } from '../mockData';
import { hasDatabaseData, getLastDatabaseUpdate, clearDatabase } from './coreService';
import { getTeams, saveTeams, getSideStatistics } from './teamsService';
import { getPlayers, savePlayers } from './playersService';
import { getMatches, saveMatches } from './matchesService';
import { getTournaments } from './tournamentsService';

// Save data to database
export const saveToDatabase = async (data: {
  teams: Team[];
  players: Player[];
  matches: Match[];
  tournaments?: any[];
}): Promise<boolean> => {
  try {
    console.log("Début de la sauvegarde dans Supabase:", {
      teamsCount: data.teams.length,
      playersCount: data.players.length,
      matchesCount: data.matches.length
    });
    
    // Vider d'abord la base de données
    await clearDatabase();
    
    // Insérer les équipes
    const teamsSuccess = await saveTeams(data.teams);
    if (!teamsSuccess) return false;
    
    // Insérer les joueurs
    const playersSuccess = await savePlayers(data.players);
    if (!playersSuccess) return false;
    
    // Insérer les matchs
    const matchesSuccess = await saveMatches(data.matches);
    if (!matchesSuccess) return false;
    
    console.log("Données sauvegardées dans Supabase avec succès");
    return true;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des données:", error);
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
