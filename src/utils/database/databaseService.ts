
import { Team, Player, Match, Tournament } from '../models/types';
import { getTeams, saveTeams } from './teams/teamsService';
import { getPlayers, savePlayers } from './players/playersService';
import { getMatches } from './matches/getMatches';
import { getTournaments } from './tournamentsService';
import { saveMatches } from './matches/saveMatches';
import { savePlayerMatchStats } from './matches/savePlayerMatchStats';
import { saveTeamMatchStats } from './matches/saveTeamStats';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  setLoadedTeams, 
  setLoadedPlayers, 
  setLoadedMatches, 
  setLoadedTournaments, 
  resetCache 
} from '../csv/cache/dataCache';
import { executeSafeDataUpdate, getLastUpdate } from './coreService';

// Save all data to the database
export async function saveToDatabase(
  data: {
    teams: Team[],
    players: Player[],
    matches: Match[],
    playerMatchStats?: any[],
    teamMatchStats?: any[]
  },
  progressCallback?: (phase: string, percent: number, current?: number, total?: number) => void
): Promise<boolean> {
  try {
    console.log(`Saving data to database (${data.teams.length} teams, ${data.players.length} players, ${data.matches.length} matches, ${data.playerMatchStats?.length || 0} player stats, ${data.teamMatchStats?.length || 0} team stats)`);
    
    // Save data update timestamp first
    await updateTimestamp();
    
    // Save teams
    progressCallback?.('teams', 10);
    const teamsResult = await saveTeams(data.teams);
    progressCallback?.('teams', 100);
    
    if (!teamsResult) {
      console.error('Failed to save teams');
      toast.error('Échec lors de l\'enregistrement des équipes');
      return false;
    }
    
    // Save players
    progressCallback?.('players', 10);
    const playersResult = await savePlayers(data.players);
    progressCallback?.('players', 100);
    
    if (!playersResult) {
      console.error('Failed to save players');
      toast.error('Échec lors de l\'enregistrement des joueurs');
      return false;
    }
    
    // Save matches
    progressCallback?.('matches', 10);
    const matchesResult = await saveMatches(data.matches);
    progressCallback?.('matches', 100);
    
    if (!matchesResult) {
      console.error('Failed to save matches');
      toast.error('Échec lors de l\'enregistrement des matchs');
      return false;
    }
    
    // Save player match stats if provided
    if (data.playerMatchStats && data.playerMatchStats.length > 0) {
      progressCallback?.('playerStats', 0, 0, data.playerMatchStats.length);
      
      await savePlayerMatchStats(data.playerMatchStats, (current, total) => {
        progressCallback?.('playerStats', Math.round((current / total) * 100), current, total);
      });
    }
    
    // Save team match stats if provided
    if (data.teamMatchStats && data.teamMatchStats.length > 0) {
      progressCallback?.('teamStats', 0, 0, data.teamMatchStats.length);
      
      await saveTeamMatchStats(data.teamMatchStats, (current, total) => {
        progressCallback?.('teamStats', Math.round((current / total) * 100), current, total);
      });
    }
    
    // Update the cache
    setLoadedTeams(data.teams);
    setLoadedPlayers(data.players);
    setLoadedMatches(data.matches);
    
    return true;
  } catch (error) {
    console.error('Error saving data to database:', error);
    toast.error('Erreur lors de l\'enregistrement des données dans la base de données');
    return false;
  }
}

// Update the last database update timestamp
export async function updateTimestamp(): Promise<boolean> {
  try {
    // Use the utility function from coreService
    return await executeSafeDataUpdate();
  } catch (error) {
    console.error('Error updating timestamp:', error);
    return false;
  }
}

// Get the last database update timestamp
export async function getLastDatabaseUpdate(): Promise<string | null> {
  try {
    // Use the utility function from coreService
    return await getLastUpdate();
  } catch (error) {
    console.error('Error getting last update timestamp:', error);
    return null;
  }
}

// Clear database - improved to handle foreign key constraints properly
export async function clearDatabase(): Promise<boolean> {
  try {
    console.log("Début de la suppression des données...");
    
    // First clear player_match_stats as it references both players and matches
    console.log("Suppression des statistiques de match des joueurs...");
    const { error: statsError } = await supabase
      .from('player_match_stats')
      .delete()
      .neq('id', 0);
    
    if (statsError) {
      console.error("Erreur lors de la suppression des statistiques:", statsError);
      toast.error(`Erreur lors de la suppression des statistiques: ${statsError.message}`);
      return false;
    }
    
    // Clear team_match_stats if it exists
    console.log("Suppression des statistiques des équipes...");
    const { error: teamStatsError } = await supabase
      .from('team_match_stats')
      .delete()
      .neq('id', 0);
    
    if (teamStatsError && !teamStatsError.message.includes('does not exist')) {
      console.error("Erreur lors de la suppression des statistiques d'équipe:", teamStatsError);
      toast.error(`Erreur lors de la suppression des statistiques d'équipe: ${teamStatsError.message}`);
      return false;
    }
    
    // Then clear matches (depends on team_blue_id and team_red_id)
    console.log("Suppression des matchs...");
    const { error: matchesError } = await supabase
      .from('matches')
      .delete()
      .neq('gameid', '');
    
    if (matchesError) {
      console.error("Erreur lors de la suppression des matchs:", matchesError);
      toast.error(`Erreur lors de la suppression des matchs: ${matchesError.message}`);
      return false;
    }
    
    // Then clear players as they reference teams
    console.log("Suppression des joueurs...");
    const { error: playersError } = await supabase
      .from('players')
      .delete()
      .neq('playerid', '');
    
    if (playersError) {
      console.error("Erreur lors de la suppression des joueurs:", playersError);
      toast.error(`Erreur lors de la suppression des joueurs: ${playersError.message}`);
      return false;
    }
    
    // Finally clear teams
    console.log("Suppression des équipes...");
    const { error: teamsError } = await supabase
      .from('teams')
      .delete()
      .neq('teamid', '');
    
    if (teamsError) {
      console.error("Erreur lors de la suppression des équipes:", teamsError);
      toast.error(`Erreur lors de la suppression des équipes: ${teamsError.message}`);
      return false;
    }
    
    // Update the last update timestamp
    await updateTimestamp();
    
    // Reset the cache
    resetCache();
    
    console.log("Suppression des données terminée avec succès");
    toast.success("Base de données vidée avec succès");
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression des données:", error);
    toast.error(`Erreur lors de la suppression des données: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return false;
  }
}

// Check if there's any data in the database
export async function hasDatabaseData(): Promise<boolean> {
  try {
    // Check if any teams exist
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('teamid')
      .limit(1);
      
    if (teamsError) {
      console.error('Error checking for teams:', teamsError);
      return false;
    }
    
    return teams && teams.length > 0;
  } catch (error) {
    console.error('Error checking database data:', error);
    return false;
  }
}

// Preload all data from the database
export async function preloadData(): Promise<void> {
  try {
    const teams = await getTeams();
    const players = await getPlayers();
    const matches = await getMatches();
    const tournaments = await getTournaments();
    
    setLoadedTeams(teams);
    setLoadedPlayers(players);
    setLoadedMatches(matches);
    setLoadedTournaments(tournaments);
  } catch (error) {
    console.error('Error preloading data:', error);
  }
}

// Re-export for backwards compatibility
export {
  getTeams,
  getPlayers,
  getMatches,
  getTournaments,
  resetCache
};
