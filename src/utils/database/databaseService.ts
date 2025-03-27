
import { Team, Player, Match } from '../models/types';
import { hasDatabaseData, getLastDatabaseUpdate, clearDatabase } from './coreService';
import { getTeams, saveTeams } from './teamsService';
import { getSideStatistics } from './sideStatisticsService';
import { getPlayers, savePlayers } from './playersService';
import { getMatches, saveMatches, savePlayerMatchStats } from './matches/matchesService';
import { getTournaments } from './tournamentsService';
import { toast } from "sonner";

// Save data to database
export const saveToDatabase = async (data: {
  teams: Team[];
  players: Player[];
  matches: Match[];
  playerMatchStats?: any[];
  tournaments?: any[];
}): Promise<boolean> => {
  try {
    console.log("Starting to save to Supabase:", {
      teamsCount: data.teams.length,
      playersCount: data.players.length,
      matchesCount: data.matches.length,
      playerStatsCount: data.playerMatchStats?.length || 0
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
    
    // Insert player match statistics if available
    if (data.playerMatchStats && data.playerMatchStats.length > 0) {
      console.log(`Saving ${data.playerMatchStats.length} player match statistics...`);
      
      // Ensure all player match stats have valid player_id and match_id
      const validPlayerStats = data.playerMatchStats.filter(stat => 
        stat && stat.player_id && stat.match_id
      );
      
      console.log(`${validPlayerStats.length} valid player stats out of ${data.playerMatchStats.length}`);
      
      if (validPlayerStats.length > 0) {
        const statsSuccess = await savePlayerMatchStats(validPlayerStats);
        if (!statsSuccess) {
          console.error("Échec lors de l'enregistrement des statistiques des joueurs");
          toast.error("Erreur lors de l'enregistrement des statistiques des joueurs");
          // Continue even if player stats failed, since the core data was saved
        } else {
          console.log("Statistiques des joueurs enregistrées avec succès");
        }
      } else {
        console.warn("No valid player match statistics to save");
      }
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
