
import { Team, Player, Match } from '../models/types';
import { hasDatabaseData, getLastDatabaseUpdate, clearDatabase } from './coreService';
import { getTeams, saveTeams } from './teamsService';
import { getSideStatistics } from './sideStatisticsService';
import { getPlayers, savePlayers } from './playersService';
import { getMatches, saveMatches, savePlayerMatchStats } from './matches/matchesService';
import { getTournaments } from './tournamentsService';
import { toast } from "sonner";

// Progress callback type
type ProgressCallback = (phase: 'teams' | 'players' | 'matches' | 'playerStats', percent: number) => void;

// Save data to database
export const saveToDatabase = async (data: {
  teams: Team[];
  players: Player[];
  matches: Match[];
  playerMatchStats?: any[];
  tournaments?: any[];
}, progressCallback?: ProgressCallback): Promise<boolean> => {
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
    progressCallback?.('teams', 100);
    
    // Insert players
    const playersSuccess = await savePlayers(data.players);
    if (!playersSuccess) {
      console.error("Échec lors de l'enregistrement des joueurs");
      toast.error("Erreur lors de l'enregistrement des joueurs");
      return false;
    }
    progressCallback?.('players', 100);
    
    // Insert matches
    const matchesSuccess = await saveMatches(data.matches);
    if (!matchesSuccess) {
      console.error("Échec lors de l'enregistrement des matchs");
      toast.error("Erreur lors de l'enregistrement des matchs");
      return false;
    }
    progressCallback?.('matches', 100);
    
    // Insert player match statistics if available
    if (data.playerMatchStats && data.playerMatchStats.length > 0) {
      console.log(`Saving ${data.playerMatchStats.length} player match statistics...`);
      
      // Ensure all player match stats have valid player_id and match_id
      const validPlayerStats = data.playerMatchStats.filter(stat => 
        stat && stat.player_id && stat.match_id
      );
      
      console.log(`${validPlayerStats.length} valid player stats out of ${data.playerMatchStats.length}`);
      
      if (validPlayerStats.length > 0) {
        // Process player stats in smaller chunks and report progress
        const TOTAL_CHUNKS = Math.ceil(validPlayerStats.length / 25);
        let chunksProcessed = 0;
        
        // Create a wrapped version of savePlayerMatchStats to track progress
        const saveWithProgress = async (stats: any[]) => {
          const result = await savePlayerMatchStats(stats);
          chunksProcessed++;
          
          // Report progress after each chunk
          if (progressCallback) {
            const percent = (chunksProcessed / TOTAL_CHUNKS) * 100;
            progressCallback('playerStats', Math.min(percent, 100));
          }
          
          return result;
        };
        
        // Process in batches of maximum 1000 stats at a time to avoid memory issues
        const BATCH_SIZE = 1000;
        let successCount = 0;
        
        for (let i = 0; i < validPlayerStats.length; i += BATCH_SIZE) {
          const batch = validPlayerStats.slice(i, i + BATCH_SIZE);
          const statsSuccess = await saveWithProgress(batch);
          
          if (statsSuccess) {
            successCount += batch.length;
          } else {
            console.error(`Échec lors de l'enregistrement du lot de statistiques ${i}-${i + batch.length}`);
          }
        }
        
        if (successCount === 0) {
          console.error("Échec lors de l'enregistrement des statistiques des joueurs");
          toast.error("Erreur lors de l'enregistrement des statistiques des joueurs");
          // Continue even if player stats failed, since the core data was saved
        } else {
          console.log(`${successCount}/${validPlayerStats.length} statistiques des joueurs enregistrées avec succès`);
          
          if (successCount < validPlayerStats.length) {
            toast.warning(`Attention: Seulement ${successCount}/${validPlayerStats.length} statistiques de joueurs ont été importées`);
          }
        }
      } else {
        console.warn("No valid player match statistics to save");
        progressCallback?.('playerStats', 100); // Mark as complete even if no stats to save
      }
    } else {
      progressCallback?.('playerStats', 100); // Mark as complete even if no stats to save
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
