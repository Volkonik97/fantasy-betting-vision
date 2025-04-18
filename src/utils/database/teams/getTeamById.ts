
import { supabase } from '@/integrations/supabase/client';
import { Team } from '@/utils/models/types';
import { Player } from '@/utils/models/types';

// Helper function to validate player role
function validatePlayerRole(role: string | null | undefined): "Top" | "Jungle" | "Mid" | "ADC" | "Support" | "Unknown" {
  if (!role) return "Unknown";
  
  const normalizedRole = role.trim().toLowerCase();
  
  switch (normalizedRole) {
    case "top":
      return "Top";
    case "jungle":
    case "jng":
      return "Jungle";
    case "mid":
    case "middle":
      return "Mid";
    case "adc":
    case "bot":
    case "bottom":
      return "ADC";
    case "support":
    case "sup":
      return "Support";
    default:
      return "Unknown";
  }
}

// Function to get a team by its ID
export const getTeamById = async (teamId: string, includeStats: boolean = true): Promise<Team | null> => {
  if (!teamId) {
    console.error("No team ID provided");
    return null;
  }
  
  console.log(`Getting team with ID: ${teamId}`);
  
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('teamid', teamId)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching team:", error);
      return null;
    }
    
    if (!data) {
      console.log(`No team found with ID: ${teamId}`);
      return null;
    }
    
    const team: Team = {
      id: data.teamid || '',
      name: data.teamname || '',
      region: data.region || '',
      logo: data.logo || '',
      winRate: data.winrate || 0,
      blueWinRate: data.winrate_blue || 0,
      redWinRate: data.winrate_red || 0,
      averageGameTime: data.avg_gamelength || 0,
      firstblood_pct: data.firstblood_pct || 0,
      avg_towers: data.avg_towers || 0,
      avg_dragons: data.avg_dragons || 0,
      avg_kill_diff: data.avg_kill_diff || 0,
      avg_kills: data.avg_kills || 0,
      avg_dragons_against: data.avg_dragons_against || 0,
      avg_towers_against: data.avg_towers_against || 0,
      avg_heralds: data.avg_heralds || 0,
      avg_void_grubs: data.avg_void_grubs || 0,
      avg_golddiffat15: data.avg_golddiffat15 || 0,
      avg_xpdiffat15: data.avg_xpdiffat15 || 0,
      avg_csdiffat15: data.avg_csdiffat15 || 0,
      players: []
    };

    // If the team has players, load their data
    if (team && includeStats) {
      try {
        const { data: playerData, error: playerError } = await supabase
          .from('players')
          .select('*')
          .eq('teamid', teamId);
        
        if (playerError) {
          console.error("Error fetching team players:", playerError);
        } else if (playerData && playerData.length > 0) {
          console.log(`Found ${playerData.length} players for team ${teamId}`);
          
          // Add players data to the team
          team.players = playerData.map(player => ({
            id: player.playerid || '',
            name: player.playername || '',
            role: validatePlayerRole(player.position || 'Unknown'),
            image: player.image || '',
            team: player.teamid || '',
            teamName: team.name,
            teamRegion: team.region,
            kda: player.kda || 0,
            csPerMin: player.cspm || 0,
            damageShare: player.damage_share || 0,
            killParticipation: player.kill_participation_pct || 0, // Changed from kill_participation_pct to match the property name
            championPool: player.champion_pool ? String(player.champion_pool) : ''
          }));
        } else {
          console.log(`No players found for team ${teamId}`);
        }
      } catch (error) {
        console.error("Exception fetching team players:", error);
      }
    }

    return team;
  } catch (error) {
    console.error("Exception in getTeamById:", error);
    return null;
  }
};

// Function to get a team with basic information (no stats)
export async function getTeamWithBasicInfo(teamId: string): Promise<Team | null> {
  if (!teamId) {
    console.error("No team ID provided");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('teamid', teamId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching team:", error);
      return null;
    }

    if (!data) {
      console.log(`No team found with ID: ${teamId}`);
      return null;
    }

    const team: Team = {
      id: data.teamid || '',
      name: data.teamname || '',
      region: data.region || '',
      logo: data.logo || '',
      winRate: data.winrate || 0,
      blueWinRate: data.winrate_blue || 0,
      redWinRate: data.winrate_red || 0,
      averageGameTime: data.avg_gamelength || 0,
      firstblood_pct: data.firstblood_pct || 0,
      avg_towers: data.avg_towers || 0,
      avg_dragons: data.avg_dragons || 0,
      avg_kill_diff: data.avg_kill_diff || 0,
      avg_kills: data.avg_kills || 0,
      avg_dragons_against: data.avg_dragons_against || 0,
      avg_towers_against: data.avg_towers_against || 0,
      avg_heralds: data.avg_heralds || 0,
      avg_void_grubs: data.avg_void_grubs || 0,
      avg_golddiffat15: data.avg_golddiffat15 || 0,
      avg_xpdiffat15: data.avg_xpdiffat15 || 0,
      avg_csdiffat15: data.avg_csdiffat15 || 0,
      players: []
    };

    // Add players information if available and requested
    const includePlayers = false; // Fixed value for this function
    if (team && includePlayers) {
      try {
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('*')
          .eq('teamid', teamId);
          
        if (playersError) {
          console.error(`Error fetching players for team ${teamId}:`, playersError);
        } else if (playersData && playersData.length > 0) {
          console.log(`Found ${playersData.length} players for team ${teamId}`);
          
          team.players = playersData.map(player => ({
            id: player.playerid || '',
            name: player.playername || '',
            role: player.position ? validatePlayerRole(player.position) : 'Unknown',
            image: player.image || '',
            team: player.teamid || '',
            teamName: team.name,
            teamRegion: team.region,
            kda: player.kda || 0,
            csPerMin: player.cspm || 0,
            damageShare: player.damage_share || 0,
            killParticipation: player.kill_participation_pct || 0, // Changed from kill_participation_pct to match the property name
            championPool: player.champion_pool ? String(player.champion_pool) : ''
          }));
        } else {
          console.log(`No players found for team ${teamId}`);
        }
      } catch (error) {
        console.error(`Exception fetching players for team ${teamId}:`, error);
      }
    }

    return team;
  } catch (error) {
    console.error("Exception in getTeamWithBasicInfo:", error);
    return null;
  }
}

// Function to get a team with its players but without complex stats
export async function getTeamWithPlayers(teamId: string): Promise<Team | null> {
  if (!teamId) {
    console.error("No team ID provided");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('teamid', teamId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching team:", error);
      return null;
    }

    if (!data) {
      console.log(`No team found with ID: ${teamId}`);
      return null;
    }

    const team: Team = {
      id: data.teamid || '',
      name: data.teamname || '',
      region: data.region || '',
      logo: data.logo || '',
      winRate: data.winrate || 0,
      blueWinRate: data.winrate_blue || 0,
      redWinRate: data.winrate_red || 0,
      averageGameTime: data.avg_gamelength || 0,
      firstblood_pct: data.firstblood_pct || 0,
      avg_towers: data.avg_towers || 0,
      avg_dragons: data.avg_dragons || 0,
      avg_kill_diff: data.avg_kill_diff || 0,
      avg_kills: data.avg_kills || 0,
      avg_dragons_against: data.avg_dragons_against || 0,
      avg_towers_against: data.avg_towers_against || 0,
      avg_heralds: data.avg_heralds || 0,
      avg_void_grubs: data.avg_void_grubs || 0,
      avg_golddiffat15: data.avg_golddiffat15 || 0,
      avg_xpdiffat15: data.avg_xpdiffat15 || 0,
      avg_csdiffat15: data.avg_csdiffat15 || 0,
      players: []
    };

    // Load players data
    const { data: playersData, error: playersError } = await supabase
      .from('players')
      .select('*')
      .eq('teamid', teamId);
      
    if (playersError) {
      console.error(`Error fetching players for team ${teamId}:`, playersError);
    } else if (playersData && playersData.length > 0) {
      console.log(`Found ${playersData.length} players for team ${teamId}`);
      team.players = playersData.map(player => ({
        id: player.playerid || '',
        name: player.playername || '',
        role: player.position ? validatePlayerRole(player.position) : 'Unknown',
        image: player.image || '',
        team: player.teamid || '',
        teamName: team.name,
        teamRegion: team.region,
        kda: player.kda || 0,
        csPerMin: player.cspm || 0,
        damageShare: player.damage_share || 0,
        killParticipation: player.kill_participation_pct || 0, // Changed from kill_participation_pct to match the property name
        championPool: player.champion_pool ? String(player.champion_pool) : ''
      }));
    } else {
      console.log(`No players found for team ${teamId}`);
    }

    return team;
  } catch (error) {
    console.error("Exception in getTeamWithPlayers:", error);
    return null;
  }
}
