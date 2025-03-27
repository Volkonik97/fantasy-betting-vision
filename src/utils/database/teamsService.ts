
import { supabase } from "@/integrations/supabase/client";
import { Team } from '../models/types';
import { chunk } from '../dataConverter';
import { getLoadedTeams, setLoadedTeams } from '../csvTypes';
import { getPlayers } from './playersService';
import { getSideStatistics as getMockSideStatistics } from '../models';

// Save teams to database
export const saveTeams = async (teams: Team[]): Promise<boolean> => {
  try {
    // Insérer les équipes par lots de 100
    const teamChunks = chunk(teams, 100);
    for (const teamChunk of teamChunks) {
      const { error: teamsError } = await supabase.from('teams').insert(
        teamChunk.map(team => ({
          id: team.id,
          name: team.name,
          logo: team.logo,
          region: team.region,
          win_rate: team.winRate,
          blue_win_rate: team.blueWinRate,
          red_win_rate: team.redWinRate,
          average_game_time: team.averageGameTime // Stocké en secondes
        }))
      );
      
      if (teamsError) {
        console.error("Erreur lors de l'insertion des équipes:", teamsError);
        return false;
      }
    }
    
    console.log("Équipes insérées avec succès");
    return true;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des équipes:", error);
    return false;
  }
};

// Get teams from database
export const getTeams = async (): Promise<Team[]> => {
  const loadedTeams = getLoadedTeams();
  if (loadedTeams) return loadedTeams;
  
  try {
    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .select('*');
    
    if (teamsError || !teamsData || teamsData.length === 0) {
      console.error("Erreur lors de la récupération des équipes:", teamsError);
      const { teams } = await import('../mockData');
      return teams;
    }
    
    const { data: playersData, error: playersError } = await supabase
      .from('players')
      .select('*');
    
    if (playersError) {
      console.error("Erreur lors de la récupération des joueurs:", playersError);
    }
    
    const teams: Team[] = teamsData.map(team => ({
      id: team.id as string,
      name: team.name as string,
      logo: team.logo as string,
      region: team.region as string,
      winRate: Number(team.win_rate) || 0,
      blueWinRate: Number(team.blue_win_rate) || 0,
      redWinRate: Number(team.red_win_rate) || 0,
      averageGameTime: Number(team.average_game_time) || 0, // Récupéré en secondes
      players: []
    }));
    
    if (playersData) {
      teams.forEach(team => {
        team.players = playersData
          .filter(player => player.team_id === team.id)
          .map(player => ({
            id: player.id as string,
            name: player.name as string,
            role: (player.role || 'Mid') as 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support',
            image: player.image as string,
            team: player.team_id as string,
            kda: Number(player.kda) || 0,
            csPerMin: Number(player.cs_per_min) || 0,
            damageShare: Number(player.damage_share) || 0,
            championPool: player.champion_pool as string[] || []
          }));
      });
    }
    
    setLoadedTeams(teams);
    return teams;
  } catch (error) {
    console.error("Erreur lors de la récupération des équipes:", error);
    const { teams } = await import('../mockData');
    return teams;
  }
};

// Get side statistics for a team
export const getSideStatistics = async (teamId: string) => {
  try {
    // Récupérer directement les statistiques simulées et attendre qu'elles soient résolues
    const stats = await getMockSideStatistics(teamId);
    return stats;
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    const stats = await getMockSideStatistics(teamId);
    return stats;
  }
};
