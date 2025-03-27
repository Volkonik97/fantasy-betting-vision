
import { Team, Player, Match } from '../models/types';
import { hasDatabaseData, getLastDatabaseUpdate, clearDatabase } from './coreService';
import { getTeams, saveTeams } from './teamsService';
import { getSideStatistics } from './sideStatisticsService';
import { getPlayers, savePlayers } from './playersService';
import { getMatches, saveMatches } from './matches/matchesService';
import { getTournaments } from './tournamentsService';
import { toast } from "sonner";

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
    
    // Insert teams
    const teamsSuccess = await saveTeams(data.teams);
    if (!teamsSuccess) {
      console.error("Échec lors de l'enregistrement des équipes");
      toast.error("Erreur lors de l'enregistrement des équipes");
      return false;
    }
    
    // Insert players
    const playersSuccess = await savePlayers(data.players);
    if (!playersSuccess) {
      console.error("Échec lors de l'enregistrement des joueurs");
      toast.error("Erreur lors de l'enregistrement des joueurs");
      return false;
    }
    
    // Insert matches
    const matchesSuccess = await saveMatches(data.matches);
    if (!matchesSuccess) {
      console.error("Échec lors de l'enregistrement des matchs");
      toast.error("Erreur lors de l'enregistrement des matchs");
      return false;
    }
    
    console.log("Données enregistrées avec succès dans Supabase");
    return true;
  } catch (error) {
    console.error("Erreur lors de l'enregistrement des données:", error);
    toast.error(`Erreur lors de l'enregistrement des données: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
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
