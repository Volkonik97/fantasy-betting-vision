
import { supabase } from '@/integrations/supabase/client';

/**
 * Diagnostic tool to check if players are correctly linked to their teams
 */
export const checkTeamPlayerLinks = async (teamId: string) => {
  try {
    // Vérifier l'existence de l'équipe
    console.log(`Checking team with ID: ${teamId}`);
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id, name')
      .eq('id', teamId)
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
    
    console.log(`Team found: ${team.name} (${team.id})`);
    
    // Vérifier les joueurs associés à cette équipe
    const { data: playersData, error: playersError } = await supabase
      .from('players')
      .select('*')
      .eq('team_id', teamId);
    
    if (playersError) {
      console.error(`Error retrieving players for team ${teamId}:`, playersError);
      return { 
        success: false, 
        error: playersError.message,
        team: {
          id: team.id || teamId,
          name: team.name || "Unknown Team",
          exists: true
        }
      };
    }
    
    if (!playersData || playersData.length === 0) {
      console.warn(`No players found for team ${team.name} (${teamId})`);
      
      // Vérifier si des joueurs existent du tout dans la base de données
      const { data: allPlayers, error: allPlayersError } = await supabase
        .from('players')
        .select('id, name, team_id')
        .limit(10);
      
      if (allPlayersError) {
        console.error("Error checking all players:", allPlayersError);
      } else {
        console.log(`First 10 players in database:`, allPlayers);
      }
      
      return { 
        success: false, 
        error: 'No players found for this team',
        team: {
          id: team.id || teamId,
          name: team.name || "Unknown Team",
          exists: true
        },
        samplePlayers: allPlayers || [] 
      };
    }
    
    // Map player data to ensure consistent format
    const formattedPlayers = playersData.map(player => ({
      id: player.id || player.playerid,
      name: player.name || player.playername,
      role: player.role || player.position
    }));
    
    console.log(`Found ${formattedPlayers.length} players for team ${team.name}:`, 
      formattedPlayers);
    
    return {
      success: true,
      team: {
        id: team.id || teamId,
        name: team.name || "Unknown Team",
        exists: true
      },
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
