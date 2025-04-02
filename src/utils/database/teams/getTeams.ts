
import { supabase } from "@/integrations/supabase/client";
import { Team, Player, PlayerRole } from '../../models/types';
import { toast } from "sonner";
import { getTeamsFromCache, updateTeamsCache, updatePlayersWithTeamName } from './teamCache';
import { teams as mockTeams } from '../../models/mockTeams';
import { normalizeRoleName } from "../../leagueData/assembler/modelConverter";

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
    // Log team regions for debugging
    console.log("Team regions:", teamsData.map(t => t.region).sort());
    
    // Fetch all players in a single query
    const { data: allPlayersData, error: playersError } = await supabase
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
    
    // Log players count for debugging
    console.log(`Processing ${allPlayersData?.length || 0} total players in database`);
    
    // Group players by team_id for faster lookup
    const playersByTeamId = allPlayersData ? allPlayersData.reduce((acc, player) => {
      if (!player.team_id) {
        console.warn(`Player ${player.name} has no team_id`);
        return acc;
      }
      
      if (!acc[player.team_id]) {
        acc[player.team_id] = [];
      }
      
      acc[player.team_id].push(player);
      return acc;
    }, {} as Record<string, any[]>) : {};
    
    // Log team IDs with players for debugging
    console.log(`Teams with players: ${Object.keys(playersByTeamId).length}`);
    
    // Assign players to their teams
    teams.forEach(team => {
      const teamPlayers = playersByTeamId[team.id] || [];
      
      if (teamPlayers.length > 0) {
        console.log(`Team ${team.name} (${team.region}) has ${teamPlayers.length} players`);
        
        team.players = teamPlayers.map(player => {
          // Always normalize role using our updated function
          const normalizedRole = normalizeRoleName(player.role);
          
          return {
            id: player.id as string,
            name: player.name as string,
            role: normalizedRole,
            image: player.image as string,
            team: player.team_id as string,
            teamName: team.name, // Always set the team name and region
            teamRegion: team.region,
            kda: Number(player.kda) || 0,
            csPerMin: Number(player.cs_per_min) || 0,
            damageShare: Number(player.damage_share) || 0,
            championPool: player.champion_pool as string[] || []
          };
        });
        
        // Count players by role for this team
        const roleCountsByTeam = team.players.reduce((acc, p) => {
          acc[p.role] = (acc[p.role] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        console.log(`Team ${team.name} (${team.region}) players by role:`, roleCountsByTeam);
      } else {
        console.warn(`No players found for team ${team.name} (${team.id}) in region ${team.region}`);
      }
    });
    
    // Count players by region after assignment
    const playersByRegion = teams.reduce((acc, team) => {
      if (team.players && team.players.length > 0) {
        acc[team.region] = (acc[team.region] || 0) + team.players.length;
      }
      return acc;
    }, {} as Record<string, number>);
    
    console.log("Players by region after team assignment:", playersByRegion);
    
    // Check specifically for LCK players
    const lckTeams = teams.filter(team => team.region === 'LCK');
    console.log(`Found ${lckTeams.length} LCK teams after processing`);
    lckTeams.forEach(team => {
      console.log(`LCK team ${team.name} has ${team.players?.length || 0} players`);
    });
    
    // Update cache
    updateTeamsCache(teams);
    
    // Update each team's players with the team name in cache
    teams.forEach(team => {
      updatePlayersWithTeamName(team.id, team.name);
    });
    
    return teams;
  } catch (error) {
    console.error("Error retrieving teams:", error);
    toast.error("Échec du chargement des données d'équipe");
    
    // Fall back to mock data
    return mockTeams;
  }
};
