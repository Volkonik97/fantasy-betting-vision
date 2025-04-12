
import { supabase } from '@/integrations/supabase/client';

/**
 * Diagnostic tool to check if players are correctly linked to their teams
 */
export const checkTeamPlayerLinks = async (teamId: string) => {
  try {
    // Check if team exists
    console.log(`Checking team with ID: ${teamId}`);
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('teamid, teamname')
      .eq('teamid', teamId)
      .single();
    
    if (teamError) {
      console.error(`Error retrieving team ${teamId}:`, teamError);
      return { 
        success: false, 
        error: teamError.message,
        teamDetails: {
          id: teamId,
          name: "Unknown Team", // Default value when team doesn't exist
          exists: false
        }
      };
    }
    
    if (!team) {
      console.warn(`Team ${teamId} not found in database`);
      return { 
        success: false, 
        error: 'Team not found',
        teamDetails: {
          id: teamId,
          name: "Unknown Team",
          exists: false
        }
      };
    }
    
    // Now we have a valid team, adjust property names
    const teamInfo = {
      id: team.teamid || teamId,
      name: team.teamname || "Unknown Team",
      exists: true
    };
    
    console.log(`Team found: ${teamInfo.name} (${teamInfo.id})`);
    
    // Check players associated with this team
    const { data: playersData, error: playersError } = await supabase
      .from('players')
      .select('*')
      .eq('teamid', teamId);
    
    if (playersError) {
      console.error(`Error retrieving players for team ${teamId}:`, playersError);
      return { 
        success: false, 
        error: playersError.message,
        team: teamInfo
      };
    }
    
    if (!playersData || playersData.length === 0) {
      console.warn(`No players found for team ${teamInfo.name} (${teamId})`);
      
      // Check if any players exist at all in the database
      const { data: allPlayers, error: allPlayersError } = await supabase
        .from('players')
        .select('playerid, playername, teamid')
        .limit(10);
      
      if (allPlayersError) {
        console.error("Error checking all players:", allPlayersError);
      } else {
        console.log(`First 10 players in database:`, allPlayers);
      }
      
      return { 
        success: false, 
        error: 'No players found for this team',
        team: teamInfo,
        samplePlayers: allPlayers || [] 
      };
    }
    
    // Map player data to ensure consistent format
    const formattedPlayers = playersData.map(player => ({
      id: player.playerid,
      name: player.playername,
      role: player.position
    }));
    
    console.log(`Found ${formattedPlayers.length} players for team ${teamInfo.name}:`, 
      formattedPlayers);
    
    return {
      success: true,
      team: teamInfo,
      players: formattedPlayers
    };
  } catch (error) {
    console.error("Error in diagnostic check:", error);
    return { 
      success: false, 
      error: String(error),
      errorDetails: error 
    };
  }
};
