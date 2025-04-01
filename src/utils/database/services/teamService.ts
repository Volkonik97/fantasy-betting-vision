import { supabase } from '@/integrations/supabase/client';
import { Team } from '../../models/types';
import { chunk } from '../../dataConverter';
import { getLoadedTeams, setLoadedTeams } from '../../csvTypes';
import { toast } from 'sonner';

// Get all teams from the database
export const getTeams = async (): Promise<Team[]> => {
  const loadedTeams = getLoadedTeams();
  if (loadedTeams) return loadedTeams;
  
  try {
    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .select('*');
    
    if (teamsError || !teamsData) {
      console.error("Erreur lors de la récupération des équipes:", teamsError);
      const { teams } = await import('../../mockData');
      return teams;
    }
    
    const teams: Team[] = teamsData.map(team => ({
      id: team.id as string,
      name: team.name as string,
      logo: team.logo as string,
      region: team.region as string,
      winRate: Number(team.win_rate) || 0,
      blueWinRate: Number(team.blue_win_rate) || 0,
      redWinRate: Number(team.red_win_rate) || 0,
      averageGameTime: Number(team.average_game_time) || 0,
      players: [] // Players will be loaded on demand
    }));
    
    setLoadedTeams(teams);
    return teams;
  } catch (error) {
    console.error("Erreur lors de la récupération des équipes:", error);
    const { teams } = await import('../../mockData');
    return teams;
  }
};

// Get team by ID
export const getTeamById = async (teamId: string): Promise<Team | null> => {
  try {
    // Check loaded teams first
    const loadedTeams = getLoadedTeams();
    if (loadedTeams) {
      const team = loadedTeams.find(t => t.id === teamId);
      if (team) return team;
    }
    
    // If not found in loaded teams, query the database
    const { data: teamData, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();
    
    if (error || !teamData) {
      console.error("Error fetching team by ID:", error);
      return null;
    }
    
    // Convert database format to application format
    const team: Team = {
      id: teamData.id as string,
      name: teamData.name as string,
      logo: teamData.logo as string,
      region: teamData.region as string,
      winRate: Number(teamData.win_rate) || 0,
      blueWinRate: Number(teamData.blue_win_rate) || 0,
      redWinRate: Number(teamData.red_win_rate) || 0,
      averageGameTime: Number(teamData.average_game_time) || 0,
      players: [] // Players will be loaded on demand
    };
    
    return team;
  } catch (error) {
    console.error("Error retrieving team by ID:", error);
    
    // Fallback to mock data if database query fails
    const { teams } = await import('../../models/mockTeams');
    return teams.find(t => t.id === teamId) || null;
  }
};

// Save teams to the database
export const saveTeams = async (teams: Team[]): Promise<boolean> => {
  try {
    console.log(`Saving ${teams.length} teams to Supabase`);
    
    // Check for duplicate team IDs
    const teamIds = teams.map(team => team.id);
    const uniqueTeamIds = new Set(teamIds);
    
    if (uniqueTeamIds.size !== teams.length) {
      console.warn(`Found ${teams.length - uniqueTeamIds.size} duplicate team IDs`);
      
      // Filter out duplicates, keeping only the first occurrence of each ID
      const seenIds = new Set<string>();
      const uniqueTeams = teams.filter(team => {
        if (seenIds.has(team.id)) {
          return false;
        }
        seenIds.add(team.id);
        return true;
      });
      
      console.log(`Filtered down to ${uniqueTeams.length} unique teams`);
      
      // Use the filtered list
      teams = uniqueTeams;
    }
    
    // Insert teams in batches of 50 using upsert
    const teamChunks = chunk(teams, 50);
    let successCount = 0;
    
    for (const teamChunk of teamChunks) {
      try {
        const { error: teamsError } = await supabase
          .from('teams')
          .upsert(
            teamChunk.map(team => ({
              id: team.id,
              name: team.name,
              logo: team.logo,
              region: team.region,
              win_rate: team.winRate,
              blue_win_rate: team.blueWinRate,
              red_win_rate: team.redWinRate,
              average_game_time: team.averageGameTime
            })),
            { onConflict: 'id' }
          );
        
        if (teamsError) {
          console.error("Erreur lors de l'upsert des équipes:", teamsError);
          toast.error(`Erreur lors de la mise à jour des équipes: ${teamsError.message}`);
          continue; // Continue with the next batch
        }
        
        successCount += teamChunk.length;
      } catch (error) {
        console.error("Erreur lors du traitement d'un lot d'équipes:", error);
        continue; // Continue with next batch
      }
    }
    
    console.log(`Successfully upserted ${successCount}/${teams.length} teams`);
    
    // Update cache if successful
    if (successCount > 0) {
      setLoadedTeams(teams);
    }
    
    return successCount > 0;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des équipes:", error);
    toast.error("Une erreur s'est produite lors de l'enregistrement des équipes");
    return false;
  }
};
