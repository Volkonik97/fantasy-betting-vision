
import { supabase } from "@/integrations/supabase/client";
import { Team } from '../../models/types';
import { toast } from "sonner";
import { getTeamsFromCache, updateTeamsCache } from './teamCache';

/**
 * Get teams from database
 */
export const getTeams = async (): Promise<Team[]> => {
  try {
    // Check if we have a recent cache
    const cachedTeams = getTeamsFromCache();
    if (cachedTeams) {
      console.log("Using cached teams data");
      return cachedTeams;
    }
    
    console.log("Fetching teams from Supabase");
    
    // Fetch teams from database
    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .select('*');
    
    if (teamsError) {
      console.error("Error retrieving teams:", teamsError);
      throw teamsError;
    }
    
    if (!teamsData || teamsData.length === 0) {
      console.warn("No teams found in database, using mock data");
      const { teams } = await import('../../models/mockTeams');
      return teams;
    }
    
    console.log(`Found ${teamsData.length} teams in database`);
    console.log("Teams by region:", teamsData.reduce((acc, team) => {
      acc[team.region] = (acc[team.region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>));
    
    // Log each team from AL region to debug
    const alTeams = teamsData.filter(team => team.region === "AL");
    console.log("AL region teams:", alTeams.map(team => ({ id: team.id, name: team.name })));
    
    // Fetch players for these teams
    const { data: playersData, error: playersError } = await supabase
      .from('players')
      .select('*');
    
    if (playersError) {
      console.error("Error retrieving players:", playersError);
      // Continue without players
    }
    
    // Convert database format to application format
    const teams: Team[] = teamsData.map(team => ({
      id: team.id as string,
      name: team.name as string,
      logo: team.logo as string,
      region: team.region as string,
      winRate: Number(team.win_rate) || 0,
      blueWinRate: Number(team.blue_win_rate) || 0,
      redWinRate: Number(team.red_win_rate) || 0,
      averageGameTime: Number(team.average_game_time) || 0, // Retrieved in seconds
      players: []
    }));
    
    // Assign players to their teams
    if (playersData && playersData.length > 0) {
      console.log(`Found ${playersData.length} players in database`);
      
      // Log players by team to debug
      const playersByTeam = playersData.reduce((acc, player) => {
        acc[player.team_id] = (acc[player.team_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log("Players by team:", playersByTeam);
      
      // Log AL region team players specifically to debug
      const alTeamIds = alTeams.map(team => team.id);
      const alPlayers = playersData.filter(player => alTeamIds.includes(player.team_id));
      console.log("AL region team players:", alPlayers.length);
      console.log("AL players sample:", alPlayers.slice(0, 3).map(p => ({ name: p.name, team_id: p.team_id })));
      
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
      
      // Log player counts by region to debug AL region specifically
      const playersByRegion = teams.reduce((acc, team) => {
        if (!acc[team.region]) acc[team.region] = 0;
        acc[team.region] += team.players.length;
        return acc;
      }, {} as Record<string, number>);
      console.log("Players by region:", playersByRegion);
    }
    
    // Cache the results
    updateTeamsCache(teams);
    
    return teams;
  } catch (error) {
    console.error("Error retrieving teams:", error);
    toast.error("Échec du chargement des données d'équipe");
    
    // Fall back to mock data
    const { teams } = await import('../../models/mockTeams');
    return teams;
  }
};
