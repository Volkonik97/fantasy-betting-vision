import { supabase } from "@/integrations/supabase/client";
import { Team, Player } from '../../models/types';
import { toast } from "sonner";
import { teams as mockTeams } from '../../models/mockTeams';
import { normalizeRoleName } from "../../leagueData/assembler/modelConverter";

const BUCKET_NAME = "team-logos";

/**
 * Get teams from database
 */
export const getTeams = async (): Promise<Team[]> => {
  try {
    console.log("Fetching teams from Supabase directly (skipping cache)");
    
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
    const regions = teamsData.map(t => t.region).filter(Boolean);
    const regionCounts = regions.reduce((acc, region) => {
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log("Team regions:", regionCounts);
    
    // Fetch all players in a single query
    const { data: allPlayersData, error: playersError } = await supabase
      .from('players')
      .select('*');
    
    if (playersError) {
      console.error("Error retrieving players:", playersError);
      // Continue without players
    }

const { data: kiinData, error: kiinError } = await supabase
  .from("players")
  .select("*")
  .ilike("name", "%kiin%");

if (kiinError) {
  console.error("❌ Erreur en récupérant Kiin :", kiinError);
} else {
  console.warn("🔍 Résultat avec ilike %kiin% :", kiinData);
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
    
    // Avant d'assigner les joueurs aux équipes, vérifier les problèmes potentiels
    if (allPlayersData) {
      console.log(`Analyzing ${allPlayersData.length} players for team assignment`);
      allPlayersData.forEach(player => {
        if (!player.team_id) {
          console.warn(`⚠️ Player ${player.name} (ID: ${player.id}) has no team_id`);
        } else {
          // Vérifiez si l'équipe existe
          const teamExists = teamsData.some(t => t.id === player.team_id);
          if (!teamExists) {
            console.warn(`⚠️ Player ${player.name} references non-existent team ID: ${player.team_id}`);
          }
        }
      });
    }
    
// Group players by team_id for faster lookup – ignore joueurs sans team_id
const playersByTeamId = allPlayersData
  ? allPlayersData.reduce((acc, player) => {
      // Debug spécifique pour Kiin
      if (player.name?.toLowerCase() === "kiin") {
        console.warn("🧪 Kiin debug :", {
          name: player.name,
          team_id: player.team_id,
          raw: player
        });
      }

      // Vérifie si team_id est valide
      if (!player.team_id) {
        console.warn(`⛔️ Joueur sans team_id : ${player.name}`, player);
        return acc;
      }

      const teamId = player.team_id;

      if (!acc[teamId]) {
        acc[teamId] = [];
      }

      acc[teamId].push(player);
      return acc;
    }, {} as Record<string, any[]>)
  : {};


    
    // Log team IDs with players for debugging
    console.log(`Teams with players: ${Object.keys(playersByTeamId).length}`);
    
    // Assign players to their teams
    teams.forEach(team => {
      const teamPlayers = playersByTeamId[team.id] || [];
      
      if (teamPlayers.length > 0) {
        console.log(`Team ${team.name} (${team.region}) has ${teamPlayers.length} players`);
        
        team.players = teamPlayers.map(player => {
          // Always normalize role using our updated function
          const normalizedRole = normalizeRoleName(player.role) || 'Unknown';
          
          return {
            id: player.id as string,
            name: player.name as string,
            role: normalizedRole, // Here normalizedRole is guaranteed to be a PlayerRole
            image: player.image as string,
            team: team.id, // Utilisez team.id au lieu de player.team_id pour assurer la cohérence
            teamName: team.name,
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
      if (team.players && team.players.length > 0) {
        console.log(`First 3 players of ${team.name}:`, team.players.slice(0, 3).map(p => `${p.name} (${p.role})`));
      }
    });
    
    // Compter le nombre total de joueurs après assignation
    const totalPlayers = teams.reduce((count, team) => count + (team.players?.length || 0), 0);
    console.log(`Total players assigned to teams: ${totalPlayers}`);
    
    return teams;
  } catch (error) {
    console.error("Error retrieving teams:", error);
    toast.error("Échec du chargement des données d'équipe");
    
    // Fall back to mock data
    return mockTeams;
  }
};
