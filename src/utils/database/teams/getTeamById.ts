
import { supabase } from '@/integrations/supabase/client';
import { Team, Player, PlayerRole } from '@/utils/models/types';
import { toast } from 'sonner';
import { adaptTeamFromDatabase } from '../adapters/teamAdapter';
import { normalizeRoleName } from '@/utils/leagueData/assembler/modelConverter';

/**
 * Get a team by its ID
 */
export const getTeamById = async (teamId: string): Promise<Team | null> => {
  try {
    if (!teamId) {
      console.error("No team ID provided");
      toast.error("Missing team ID");
      return null;
    }

    console.log(`Getting team by ID: ${teamId}`);

    // First fetch team data from team_summary_view if available
    try {
      const { data: summaryData, error: summaryError } = await supabase
        .from('team_summary_view')
        .select('*')
        .eq('teamid', teamId)
        .maybeSingle();

      if (!summaryError && summaryData) {
        console.log("Found team summary data:", summaryData);
        
        // If we have data from the summary view, use it as the primary source
        const team = adaptTeamFromDatabase(summaryData);
        
        // Now fetch players for this team
        // First try player_summary_view to get enriched player data including damage_share
        const { data: playerSummaryData, error: playerSummaryError } = await supabase
          .from('player_summary_view')
          .select('*')
          .eq('teamid', teamId);
          
        if (!playerSummaryError && playerSummaryData && playerSummaryData.length > 0) {
          console.log(`Found ${playerSummaryData.length} players in player_summary_view for team ${teamId}`);
          
          // Add players to the team object - use player_summary_view data for better stats
          team.players = playerSummaryData.map(player => {
            console.log(`Processing player ${player.playername} with damage_share:`, player.damage_share);
            
            return {
              id: player.playerid,
              name: player.playername,
              role: normalizeRoleName(player.position) as PlayerRole,
              image: player.image || '',
              team: player.teamid,
              teamName: team.name,
              teamRegion: team.region,
              kda: player.kda || 0,
              csPerMin: player.cspm || 0,
              damageShare: player.damage_share || 0,
              championPool: player.champion_pool ? String(player.champion_pool) : '0'
            };
          });
        } else {
          // Fallback to regular players table if player_summary_view didn't work
          const { data: playersData, error: playersError } = await supabase
            .from('players')
            .select('*')
            .eq('teamid', teamId);
            
          if (!playersError && playersData && playersData.length > 0) {
            console.log(`Found ${playersData.length} players for team ${teamId}`);
            // Add players to the team object - ensure role is properly cast to PlayerRole
            team.players = playersData.map(player => ({
              id: player.playerid,
              name: player.playername,
              role: normalizeRoleName(player.position) as PlayerRole,
              image: player.image || '',
              team: player.teamid,
              teamName: team.name,
              teamRegion: team.region,
              kda: player.kda || 0,
              csPerMin: player.cspm || 0,
              damageShare: player.damage_share || 0,
              championPool: player.champion_pool ? String(player.champion_pool) : '0'
            }));
          } else {
            console.log(`No players found for team ${teamId}`);
            team.players = [];
          }
        }
        
        return team;
      }
    } catch (summaryError) {
      console.warn("Could not fetch team summary data:", summaryError);
      // Continue with regular team data
    }

    // Fallback to the regular teams table if team_summary_view didn't work
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('teamid', teamId)
      .single();

    if (error) {
      console.error("Error fetching team:", error);
      toast.error("Failed to load team details");
      return null;
    }

    if (!data) {
      console.log(`No team found with ID: ${teamId}`);
      return null;
    }

    console.log("Team data retrieved:", data);
    
    // Convert retrieved data to proper team object
    const team = adaptTeamFromDatabase(data);
    
    // Fetch players for this team
    const { data: playersData, error: playersError } = await supabase
      .from('players')
      .select('*')
      .eq('teamid', teamId);
      
    if (!playersError && playersData && playersData.length > 0) {
      console.log(`Found ${playersData.length} players for team ${teamId}`);
      // Add players to the team object - ensure role is properly cast to PlayerRole
      team.players = playersData.map(player => ({
        id: player.playerid,
        name: player.playername,
        role: normalizeRoleName(player.position) as PlayerRole,
        image: player.image || '',
        team: player.teamid,
        teamName: team.name,
        teamRegion: team.region,
        kda: player.kda || 0,
        csPerMin: player.cspm || 0,
        damageShare: player.damage_share || 0,
        championPool: player.champion_pool ? String(player.champion_pool) : '0'
      }));
    } else {
      console.log(`No players found for team ${teamId}`);
      team.players = [];
    }
    
    return team;
  } catch (error) {
    console.error("Exception in getTeamById:", error);
    toast.error("An error occurred while fetching team details");
    return null;
  }
};
