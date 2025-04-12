import { supabase } from '@/integrations/supabase/client';
import { Team } from '@/utils/models/types';
import { toast } from 'sonner';
import { adaptTeamFromDatabase } from '../adapters/teamAdapter';

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

    // Fetch team data
    const { data: teamData, error } = await supabase
      .from('teams')
      .select('*')
      .eq('teamid', teamId)
      .single();

    if (error) {
      console.error("Error fetching team:", error);
      toast.error("Failed to load team details");
      return null;
    }

    if (!teamData) {
      console.log(`No team found with ID: ${teamId}`);
      return null;
    }

    console.log("Team data retrieved:", teamData);

    // Try to get summary data from team_summary_view if available
    try {
      const { data: summaryData, error: summaryError } = await supabase
        .from('team_summary_view')
        .select('*')
        .eq('teamid', teamId)
        .maybeSingle();

      if (!summaryError && summaryData) {
        console.log("Found team summary data:", summaryData);
        
        // Create a combined team object with data from both sources
        const teamData = adaptTeamFromDatabase(teamData);
        const mergedTeam: Team = {
          ...teamData,
          aggression_score: summaryData.aggression_score || 0,
          earlygame_score: summaryData.earlygame_score || 0,
          objectives_score: summaryData.objectives_score || 0,
          dragon_diff: summaryData.dragon_diff || 0,
          tower_diff: summaryData.tower_diff || 0
        };
        
        return mergedTeam;
      }
    } catch (summaryError) {
      console.warn("Could not fetch team summary data:", summaryError);
      // Continue with regular team data
    }

    // Convert to application format using adapter
    const team = adaptTeamFromDatabase(teamData);
    return team;
  } catch (error) {
    console.error("Exception in getTeamById:", error);
    toast.error("An error occurred while fetching team details");
    return null;
  }
};
