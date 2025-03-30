
import { Team, Player, Match, Tournament } from '../models/types';
import { getTeams, saveTeams } from './teamsService';
import { getPlayers } from './playersService';
import { getMatches, getMatchesByTeamId } from './matches/matchesService';
import { getTournaments } from './tournamentsService';
import { saveMatches } from './matches/saveMatches';
import { savePlayers } from './playersService';
import { savePlayerMatchStats } from './matches/savePlayerMatchStats';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { setLoadedTeams, setLoadedPlayers, setLoadedMatches, setLoadedTournaments } from '../csvTypes';

// Save all data to the database
export async function saveToDatabase(
  data: {
    teams: Team[],
    players: Player[],
    matches: Match[],
    playerMatchStats?: any[]
  },
  progressCallback?: (phase: string, percent: number, current?: number, total?: number) => void
): Promise<boolean> {
  try {
    console.log(`Saving data to database (${data.teams.length} teams, ${data.players.length} players, ${data.matches.length} matches, ${data.playerMatchStats?.length || 0} player stats)`);
    
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

// Clear all data from the database
export async function clearDatabase(): Promise<boolean> {
  try {
    // Clear data in order to respect foreign key constraints
    const tables = [
      'player_match_stats',
      'players',
      'matches',
      'teams',
      'data_updates'
    ];
    
    for (const table of tables) {
      // Fixed: For UUID columns, we need to use a proper condition
      let deleteQuery;
      
      if (table === 'player_match_stats') {
        // For player_match_stats, use a different condition since it has UUID id
        const { error } = await supabase
          .from(table as "player_match_stats")
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
    setLoadedTeams(null);
    setLoadedPlayers(null);
    setLoadedMatches(null);
    setLoadedTournaments(null);
    
    return true;
  } catch (error) {
    console.error('Error clearing database:', error);
    toast.error('Erreur lors de la suppression des données de la base de données');
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

// Update the last data update timestamp
export async function updateTimestamp(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('data_updates')
      .upsert([{ id: 1, updated_at: new Date().toISOString() }]);
      
    if (error) {
      console.error('Error updating timestamp:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating timestamp:', error);
    return false;
  }
}

// Get the last database update timestamp
export async function getLastDatabaseUpdate(): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('data_updates')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error || !data) {
      console.error('Error getting last update timestamp:', error);
      return null;
    }
    
    return data.updated_at;
  } catch (error) {
    console.error('Error getting last update timestamp:', error);
    return null;
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
  getTournaments
};
