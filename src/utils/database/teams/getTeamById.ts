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
        // Try to get player data from player_summary_view first to access kill_participation_pct
        const { data: summaryData, error: summaryError } = await supabase
          .from('player_summary_view')
          .select('*')
          .eq('teamid', teamId);
          
        if (summaryError) {
          console.error("Error fetching team players from summary view:", summaryError);
          
          // Fall back to regular players table if there's an error
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
              // We don't have kill_participation_pct in this table, so we have to leave it at 0
              killParticipation: 0,
              kill_participation_pct: 0, // Ensure this is included for type compatibility
              championPool: player.champion_pool ? String(player.champion_pool) : ''
            }));
          } else {
            console.log(`No players found for team ${teamId}`);
          }
        } else if (summaryData && summaryData.length > 0) {
          console.log(`Found ${summaryData.length} players in summary view for team ${teamId}`);
          
          // Successfully got data from player_summary_view
          team.players = summaryData.map(player => {
            console.log(`Player ${player.playername} data from summary_view:`, {
              playerid: player.playerid,
              kda: player.kda,
              cspm: player.cspm,
              damageShare: player.damage_share,
              killParticipation: player.kill_participation_pct,
              killParticipationType: typeof player.kill_participation_pct
            });
            
            const killParticipationValue = player.kill_participation_pct || 0;
            
            return {
              id: player.playerid || '',
              name: player.playername || '',
              role: validatePlayerRole(player.position || 'Unknown'),
              // Fetch image from players table or use empty string as fallback
              image: '', // Can't access image from summary view
              team: player.teamid || '',
              teamName: team.name,
              teamRegion: team.region,
              kda: player.kda || 0,
              csPerMin: player.cspm || 0,
              damageShare: player.damage_share || 0,
              // Use kill_participation_pct from player_summary_view
              killParticipation: killParticipationValue,
              kill_participation_pct: killParticipationValue, // Ensure both fields have the same value
              championPool: '' // Can't access champion_pool from summary view
            }
          });
          
          // After getting basic data from summary view, fetch additional fields from players table
          if (team.players.length > 0) {
            const playerIds = team.players.map(p => p.id);
            const { data: additionalData, error: additionalError } = await supabase
              .from('players')
              .select('playerid, image, champion_pool')
              .in('playerid', playerIds);
              
            if (!additionalError && additionalData && additionalData.length > 0) {
              // Create a map for quick lookup
              const additionalDataMap = new Map(
                additionalData.map(item => [item.playerid, { 
                  image: item.image, 
                  championPool: item.champion_pool 
                }])
              );
              
              // Enhance player data with the additional fields
              team.players = team.players.map(player => {
                const additional = additionalDataMap.get(player.id);
                return {
                  ...player,
                  image: additional?.image || '',
                  championPool: additional?.championPool ? String(additional.championPool) : ''
                };
              });
            }
          }
        } else {
          console.log(`No players found for team ${teamId} in summary view`);
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

    // Try to get player data from player_summary_view first to access kill_participation_pct
    const { data: summaryData, error: summaryError } = await supabase
      .from('player_summary_view')
      .select('*')
      .eq('teamid', teamId);
      
    if (summaryError) {
      console.error(`Error fetching players from summary view for team ${teamId}:`, summaryError);
      
      // Fall back to regular players table
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
          // We don't have kill_participation_pct in this table
          killParticipation: 0,
          kill_participation_pct: 0, // Include for type compatibility
          championPool: player.champion_pool ? String(player.champion_pool) : ''
        }));
      } else {
        console.log(`No players found for team ${teamId}`);
      }
    } else if (summaryData && summaryData.length > 0) {
      console.log(`Found ${summaryData.length} players in summary view for team ${teamId}`);
      
      // Successfully got data from player_summary_view
      team.players = summaryData.map(player => {
        console.log(`Player ${player.playername} data from summary_view (getTeamWithPlayers):`, {
          playerid: player.playerid,
          kda: player.kda,
          cspm: player.cspm,
          damageShare: player.damage_share,
          killParticipation: player.kill_participation_pct,
          killParticipationType: typeof player.kill_participation_pct
        });
        
        const killParticipationValue = player.kill_participation_pct || 0;
        
        return {
          id: player.playerid || '',
          name: player.playername || '',
          role: player.position ? validatePlayerRole(player.position) : 'Unknown',
          // Fetch image from players table or use empty string as fallback
          image: '', // Initially set empty
          team: player.teamid || '',
          teamName: team.name,
          teamRegion: team.region,
          kda: player.kda || 0,
          csPerMin: player.cspm || 0,
          damageShare: player.damage_share || 0,
          // Use kill_participation_pct from player_summary_view
          killParticipation: killParticipationValue,
          kill_participation_pct: killParticipationValue, // Ensure both fields have the same value
          championPool: '' // Initially set empty
        }
      });
      
      // After getting basic data from summary view, fetch additional fields from players table
      if (team.players.length > 0) {
        const playerIds = team.players.map(p => p.id);
        const { data: additionalData, error: additionalError } = await supabase
          .from('players')
          .select('playerid, image, champion_pool')
          .in('playerid', playerIds);
          
        if (!additionalError && additionalData && additionalData.length > 0) {
          // Create a map for quick lookup
          const additionalDataMap = new Map(
            additionalData.map(item => [item.playerid, { 
              image: item.image, 
              championPool: item.champion_pool 
            }])
          );
          
          // Enhance player data with the additional fields
          team.players = team.players.map(player => {
            const additional = additionalDataMap.get(player.id);
            return {
              ...player,
              image: additional?.image || '',
              championPool: additional?.championPool ? String(additional.championPool) : ''
            };
          });
        }
      }
    } else {
      console.log(`No players found for team ${teamId} in summary view`);
    }

    return team;
  } catch (error) {
    console.error("Exception in getTeamWithPlayers:", error);
    return null;
  }
}
