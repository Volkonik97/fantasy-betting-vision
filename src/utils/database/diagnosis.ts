
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
      return { success: false, error: teamError.message };
    }
    
    if (!team) {
      console.warn(`Team ${teamId} not found in database`);
      return { success: false, error: 'Team not found' };
    }
    
    console.log(`Team found: ${team.name} (${team.id})`);
    
    // Vérifier les joueurs associés à cette équipe
    const { data: playersData, error: playersError } = await supabase
      .from('players')
      .select('*')
      .eq('team_id', teamId);
    
    if (playersError) {
      console.error(`Error retrieving players for team ${teamId}:`, playersError);
      return { success: false, error: playersError.message };
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
        team: team,
        samplePlayers: allPlayers || [] 
      };
    }
    
    console.log(`Found ${playersData.length} players for team ${team.name}:`, 
      playersData.map(p => ({ id: p.id, name: p.name, role: p.role })));
    
    return {
      success: true,
      team: team,
      players: playersData
    };
  } catch (error) {
    console.error("Error in diagnostic check:", error);
    return { success: false, error: String(error) };
  }
};
