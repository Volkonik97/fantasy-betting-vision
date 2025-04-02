
import { supabase } from "@/integrations/supabase/client";
import { Team } from '../../models/types';
import { toast } from "sonner";
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
    
    console.log(`Fetching team ${teamId} from Supabase (bypassing cache)`);
    
    // Fetch team from database - always get fresh data
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
    
    // Fetch ALL players for this team - always get fresh data
    const { data: playersData, error: playersError } = await supabase
      .from('players')
      .select('*')
      .eq('team_id', teamId);
    
    // Debug log to see what we're getting back
    console.log(`Team ${teamId} (${teamData.name}) - Players query results:`, 
      playersData ? `${playersData.length} players found` : "No players data");
    
    if (playersError) {
      console.error(`Error retrieving players for team ${teamId}:`, playersError);
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
    
    // Assign players to the team if we have any
    if (playersData && playersData.length > 0) {
      console.log(`Processing ${playersData.length} players for team ${teamData.name}`);
      
      // Log roles for debugging
      const roles = playersData.map(p => p.role);
      console.log(`Roles before normalization for team ${teamData.name}:`, roles);
      
      team.players = playersData.map(player => {
        // Always normalize role
        const normalizedRole = normalizeRoleName(player.role);
        
        // Log for debugging
        console.log(`Adding player: ${player.name}, Original Role: ${player.role}, Normalized Role: ${normalizedRole}, ID: ${player.id}, Team: ${player.team_id}`);
        
        return {
          id: player.id as string,
          name: player.name as string,
          role: normalizedRole,
          image: player.image as string,
          team: player.team_id as string,
          teamName: team.name, // Set the team name directly
          teamRegion: team.region,
          kda: Number(player.kda) || 0,
          csPerMin: Number(player.cs_per_min) || 0,
          damageShare: Number(player.damage_share) || 0,
          championPool: player.champion_pool as string[] || []
        };
      });
      
      // Check if we have all roles covered
      const hasAllRoles = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'].every(role => 
        team.players.some(player => normalizeRoleName(player.role) === role)
      );
      
      if (!hasAllRoles) {
        console.warn(`Team ${teamData.name} is missing one or more standard roles`);
        
        // Log the roles we have
        const roleMap = team.players.reduce((acc, player) => {
          const role = normalizeRoleName(player.role);
          acc[role] = (acc[role] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        console.log(`Role distribution for team ${teamData.name}:`, roleMap);
      }
      
      console.log(`Team ${teamData.name} has ${team.players.length} players after processing`);
      console.log(`Player roles: ${team.players.map(p => `${p.name} (${p.role})`).join(', ')}`);
    } else {
      console.warn(`No players found for team ${teamData.name} (${teamId})`);
      
      // Double check by querying with a different approach
      const { data: altPlayersData, error: altError } = await supabase
        .from('players')
        .select('*');
      
      if (altError) {
        console.error(`Error fetching all players:`, altError);
      } else if (altPlayersData) {
        const teamPlayers = altPlayersData.filter(p => p.team_id === teamId);
        console.log(`Alternative query found ${teamPlayers.length} players for team ${teamId}`);
        
        if (teamPlayers.length > 0) {
          console.log(`Found players through alternative query, adding them to the team`);
          team.players = teamPlayers.map(player => {
            const normalizedRole = normalizeRoleName(player.role);
            return {
              id: player.id as string,
              name: player.name as string,
              role: normalizedRole,
              image: player.image as string,
              team: player.team_id as string,
              teamName: team.name,
              teamRegion: team.region,
              kda: Number(player.kda) || 0,
              csPerMin: Number(player.cs_per_min) || 0,
              damageShare: Number(player.damage_share) || 0,
              championPool: player.champion_pool as string[] || []
            };
          });
          
          console.log(`Added ${team.players.length} players using alternative query`);
          console.log(`Player roles (alt): ${team.players.map(p => `${p.name} (${p.role})`).join(', ')}`);
        }
      }
    }
    
    return team;
  } catch (error) {
    console.error(`Error retrieving team ${teamId}:`, error);
    toast.error("Échec du chargement des données d'équipe");
    return null;
  }
};
