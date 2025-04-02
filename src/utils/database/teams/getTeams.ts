
import { supabase } from "@/integrations/supabase/client";
import { Team } from '../../models/types';
import { toast } from "sonner";
import { getTeamsFromCache, updateTeamsCache, updatePlayersWithTeamName } from './teamCache';
import { teams as mockTeams } from '../../models/mockTeams';

const BUCKET_NAME = "team-logos";

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
      return mockTeams;
    }
    
    console.log(`Found ${teamsData.length} teams in database`);
    
    // Fetch players for these teams
    const { data: playersData, error: playersError } = await supabase
      .from('players')
      .select('*');
    
    if (playersError) {
      console.error("Error retrieving players:", playersError);
      // Continue without players
    }
    
    // Convert database format to application format
    const teams: Team[] = teamsData.map(team => {
      // Check if there's a custom logo in Supabase storage
      let logoUrl = team.logo as string;
      
      // If the logo URL is not from storage, check if there's a logo in storage
      if (logoUrl && !logoUrl.includes(BUCKET_NAME)) {
        // Try to generate a storage URL based on team ID
        const { data: { publicUrl } } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(`${team.id}.png`);
        
        // Use the storage URL if it exists, otherwise fall back to the database URL
        if (publicUrl) {
          logoUrl = publicUrl;
        }
      }
      
      return {
        id: team.id as string,
        name: team.name as string,
        logo: logoUrl,
        region: team.region as string,
        winRate: Number(team.win_rate) || 0,
        blueWinRate: Number(team.blue_win_rate) || 0,
        redWinRate: Number(team.red_win_rate) || 0,
        averageGameTime: Number(team.average_game_time) || 0,
        players: []
      };
    });
    
    // Assign players to their teams
    if (playersData && playersData.length > 0) {
      console.log(`Found ${playersData.length} players in database`);
      
      teams.forEach(team => {
        team.players = playersData
          .filter(player => player.team_id === team.id)
          .map(player => ({
            id: player.id as string,
            name: player.name as string,
            role: (player.role || 'Mid') as 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support',
            image: player.image as string,
            team: player.team_id as string,
            teamName: team.name, // Always set the teamName from the team.name
            kda: Number(player.kda) || 0,
            csPerMin: Number(player.cs_per_min) || 0,
            damageShare: Number(player.damage_share) || 0,
            championPool: player.champion_pool as string[] || []
          }));
      });
    }
    
    // Update each team's players with the team name in cache
    teams.forEach(team => {
      updatePlayersWithTeamName(team.id, team.name);
    });
    
    // Cache the results
    updateTeamsCache(teams);
    
    return teams;
  } catch (error) {
    console.error("Error retrieving teams:", error);
    toast.error("Échec du chargement des données d'équipe");
    
    // Fall back to mock data
    return mockTeams;
  }
};
