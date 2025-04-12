
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
    const baseTeam = adaptTeamFromDatabase(data);
    
    // Try to get summary data from team_summary_view if available
    try {
      const { data: summaryData, error: summaryError } = await supabase
        .from('team_summary_view')
        .select('*')
        .eq('teamid', teamId)
        .maybeSingle();

      if (!summaryError && summaryData) {
        console.log("Found team summary data:", summaryData);
        
        // If we have winrate data from summary view, convert percent to decimal format
        let winRates = {};
        if (summaryData.winrate_percent !== undefined) {
          winRates = {
            winRate: summaryData.winrate_percent / 100,
            blueWinRate: (summaryData.winrate_blue_percent || 0) / 100,
            redWinRate: (summaryData.winrate_red_percent || 0) / 100,
          };
        }
        
        // Create a combined team object with data from both sources
        const mergedTeam: Team = {
          ...baseTeam,
          ...winRates,
          aggression_score: summaryData.aggression_score || 0,
          earlygame_score: summaryData.earlygame_score || 0,
          objectives_score: summaryData.objectives_score || 0,
          dragon_diff: summaryData.dragon_diff || 0,
          tower_diff: summaryData.tower_diff || 0
        };
        
        // Ensure players array is initialized
        mergedTeam.players = mergedTeam.players || [];
        
        return mergedTeam;
      }
    } catch (summaryError) {
      console.warn("Could not fetch team summary data:", summaryError);
      // Continue with regular team data
    }

    // Ensure players array is initialized
    baseTeam.players = baseTeam.players || [];
    
    return baseTeam;
  } catch (error) {
    console.error("Exception in getTeamById:", error);
    toast.error("An error occurred while fetching team details");
    return null;
  }
};
