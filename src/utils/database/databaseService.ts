import { Team, Player, Match } from '../models/types';
import { hasDatabaseData, getLastDatabaseUpdate, clearDatabase, updateLastUpdate, resetCache } from './coreService';
import { getTeams, saveTeams } from './teamsService';
import { getSideStatistics } from './sideStatisticsService';
import { getPlayers, savePlayers } from './playersService';
import { getMatches, saveMatches, savePlayerMatchStats } from './matches/matchesService';
import { getTournaments } from './tournamentsService';
import { toast } from "sonner";

// Progress callback type
type ProgressCallback = (phase: 'teams' | 'players' | 'matches' | 'playerStats', percent: number) => void;

// Save data to database
export const saveToDatabase = async (
  data: {
    teams: Team[];
    players: Player[];
    matches: Match[];
    playerMatchStats: any[];
  },
  progressCallback?: (phase: string, percent: number, current?: number, total?: number) => void
): Promise<boolean> => {
  try {
    // Save teams
    console.log(`Saving ${data.teams.length} teams to Supabase`);
    progressCallback?.('teams', 0);
    const teamsResult = await saveTeams(data.teams);
    if (!teamsResult) return false;
    progressCallback?.('teams', 100);
    
    // Save players
    console.log(`Saving ${data.players.length} players to Supabase`);
    progressCallback?.('players', 0);
    const playersResult = await savePlayers(data.players);
    if (!playersResult) return false;
    progressCallback?.('players', 100);
    
    // Save matches
    console.log(`Saving ${data.matches.length} matches to Supabase`);
    progressCallback?.('matches', 0);
    const matchesResult = await saveMatches(data.matches);
    if (!matchesResult) return false;
    progressCallback?.('matches', 100);
    
    // Save player match statistics
    if (data.playerMatchStats && data.playerMatchStats.length > 0) {
      console.log(`Saving ${data.playerMatchStats.length} player match statistics...`);
      progressCallback?.('playerStats', 0, 0, data.playerMatchStats.length);
      
      console.log(`${data.playerMatchStats.length} valid player stats out of ${data.playerMatchStats.length}`);
      
      // Use new savePlayerMatchStats with progress tracking
      const playerStatsResult = await savePlayerMatchStats(data.playerMatchStats, 
        (current, total) => {
          const percent = Math.round((current / total) * 100);
          progressCallback?.('playerStats', percent, current, total);
        }
      );
      
      if (!playerStatsResult) {
        console.warn("Some player match statistics failed to save");
        // Continue anyway since teams, players, and matches are saved
      }
    }
    
    // Update last update timestamp
    await updateLastUpdate();
    
    // Reset all caches
    resetCache();
    
    return true;
  } catch (error) {
    console.error("Error saving data to database:", error);
    toast.error("Erreur lors de l'enregistrement des données dans la base de données");
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
