
import { supabase } from "@/integrations/supabase/client";
import { Team } from '../../models/types';
import { toast } from "sonner";
import { findTeamInCache, updateTeamInCache } from './teamCache';
import { normalizeRoleName } from "../../leagueData/assembler/modelConverter";

/**
 * Get a single team by ID
 */
export const getTeamById = async (teamId: string): Promise<Team | null> => {
  try {
    if (!teamId) {
      console.error("No team ID provided");
      return null;
    }
    
    // Try to find in cache first
    const cachedTeam = findTeamInCache(teamId);
    if (cachedTeam) {
      console.log(`Found team ${teamId} in cache`);
      return cachedTeam;
    }
    
    console.log(`Fetching team ${teamId} from Supabase`);
    
    // Fetch team from database
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();
    
    if (teamError) {
      console.error(`Error retrieving team ${teamId}:`, teamError);
      return null;
    }
    
    if (!teamData) {
      console.warn(`Team ${teamId} not found in database`);
      return null;
    }
    
    // Fetch players for this team
    const { data: playersData, error: playersError } = await supabase
      .from('players')
      .select('*')
      .eq('team_id', teamId);
    
    // Debug log to see what we're getting back
    console.log(`Team ${teamId} (${teamData.name}) - Players query results:`, 
      playersData ? `${playersData.length} players found` : "No players data");
    
    if (playersError) {
      console.error(`Error retrieving players for team ${teamId}:`, playersError);
      // Continue without players
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
      players: []
    };
    
    // Assign players to the team
    if (playersData && playersData.length > 0) {
      console.log(`Processing ${playersData.length} players for team ${teamData.name}`);
      
      team.players = playersData.map(player => {
        // Ensure role is normalized
        const normalizedRole = normalizeRoleName(player.role || 'Mid');
        
        // Log for debugging
        console.log(`Adding player: ${player.name}, Role: ${normalizedRole}, Team: ${player.team_id}`);
        
        return {
          id: player.id as string,
          name: player.name as string,
          role: normalizedRole,
          image: player.image as string,
          team: player.team_id as string,
          teamName: team.name, // Set the team name directly
          kda: Number(player.kda) || 0,
          csPerMin: Number(player.cs_per_min) || 0,
          damageShare: Number(player.damage_share) || 0,
          championPool: player.champion_pool as string[] || []
        };
      });
      
      console.log(`Team ${teamData.name} has ${team.players.length} players after processing`);
    } else {
      console.warn(`No players found for team ${teamData.name} (${teamId})`);
    }
    
    // Update cache
    updateTeamInCache(team);
    
    return team;
  } catch (error) {
    console.error(`Error retrieving team ${teamId}:`, error);
    toast.error("Échec du chargement des données d'équipe");
    return null;
  }
};
