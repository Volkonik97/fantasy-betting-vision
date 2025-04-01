
import { Team, Player, Match, Tournament } from '../../models/types';
import { saveTeams, getTeams } from './teamService';
import { getPlayers, savePlayers } from './playerService';
import { getMatches, getMatchesByTeamId } from '../matches/getMatches';
import { getTournaments } from './tournamentService';
import { saveMatches } from '../matches/saveMatches';
import { savePlayerMatchStats } from '../matches/savePlayerMatchStats';
import { saveTeamMatchStats } from '../matches/saveTeamStats';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { setLoadedTeams, setLoadedPlayers, setLoadedMatches, setLoadedTournaments } from '../../csvTypes';
import { updateTimestamp, getLastDatabaseUpdate } from './dataUpdateService';
import { resetCache } from '../../csvTypes';

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

// Check if there's any data in the database
export async function hasDatabaseData(): Promise<boolean> {
  try {
    // Check if any teams exist
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id')
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

// Clear all data from the database
export async function clearDatabase(): Promise<boolean> {
  try {
    // Clear data in order to respect foreign key constraints
    const tables = [
      'player_match_stats',
      'team_match_stats',
      'players',
      'matches',
      'teams',
      'data_updates'
    ];
    
    for (const table of tables) {
      // Fixed: For UUID columns, we need to use a proper condition
      let deleteQuery;
      
      if (table === 'player_match_stats' || table === 'team_match_stats') {
        // For tables with UUID id, use a different condition
        const { error } = await supabase
          .from(table as any)
          .delete()
          .not('id', 'is', null); // Delete all rows where id is not null
        
        if (error) {
          console.error(`Error clearing ${table}:`, error);
          toast.error(`Erreur lors de la suppression des données de ${table}: ${error.message}`);
          return false;
        }
      } else {
        // For other tables, delete all rows
        const { error } = await supabase
          .from(table as any)
          .delete()
          .not('id', 'is', null);
        
        if (error) {
          console.error(`Error clearing ${table}:`, error);
          toast.error(`Erreur lors de la suppression des données de ${table}: ${error.message}`);
          return false;
        }
      }
    }
    
    // Clear the cache
    resetCache();
    
    return true;
  } catch (error) {
    console.error('Error clearing database:', error);
    toast.error('Erreur lors de la suppression des données de la base de données');
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

// Re-export service functions for backwards compatibility
export {
  getTeams,
  getPlayers,
  getMatches,
  getMatchesByTeamId,
  getTournaments,
  getLastDatabaseUpdate
};
