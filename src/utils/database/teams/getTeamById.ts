
import { supabase } from "@/integrations/supabase/client";
import { Team, Player } from '../../models/types';
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
    
    if (playersError) {
      console.error(`Error retrieving players for team ${teamId}:`, playersError);
      // Continue without players
    }
    
    // Convert database format to application format
    const team: Team = {
      id: teamData.id,
      name: teamData.name,
      logo: teamData.logo || '',
      region: teamData.region || '',
      winRate: Number(teamData.win_rate) || 0,
      blueWinRate: Number(teamData.blue_win_rate) || 0,
      redWinRate: Number(teamData.red_win_rate) || 0,
      averageGameTime: Number(teamData.average_game_time) || 0,
      players: []
    };
    
    // Assign players to the team
    if (playersData && playersData.length > 0) {
      console.log(`Found ${playersData.length} players for team ${teamId}`);
      
      team.players = playersData.map(player => {
        const playerRole = normalizeRoleName(player.role || 'Mid');
        
        return {
          id: player.id,
          name: player.name || '',
          role: playerRole,
          image: player.image || '',
          team: player.team_id,
          teamName: team.name,
          kda: Number(player.kda) || 0,
          csPerMin: Number(player.cs_per_min) || 0,
          damageShare: Number(player.damage_share) || 0,
          championPool: Array.isArray(player.champion_pool) ? player.champion_pool : []
        } as Player;
      });
      
      console.log(`Successfully mapped ${team.players.length} players for team ${teamId}`);
      
      // Log some player data for debugging
      if (team.players.length > 0) {
        console.log("Sample player data:", JSON.stringify(team.players[0]));
      }
    } else {
      console.warn(`No players found for team ${teamId} in database`);
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
