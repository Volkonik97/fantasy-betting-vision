import { supabase } from "@/integrations/supabase/client";
import { Team } from "@/utils/models/types";
import { toast } from "sonner";

/**
 * Fetches all teams from the database
 */
export const getAllTeams = async (): Promise<Team[]> => {
  try {
    console.log("Fetching all teams from database");
    
    const { data, error } = await supabase
      .from('teams')
      .select('*');
    
    if (error) {
      console.error("Error fetching teams:", error);
      toast.error("Failed to load teams");
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log("No teams found in database");
      return [];
    }
    
    console.log(`Retrieved ${data.length} teams from database`);
    
    // Map database teams to our application Team model
    return data.map(team => ({
      id: team.teamid || '',
      name: team.teamname || '',
      region: team.region || '',
      logo: team.logo || '',
      winRate: team.winrate || 0,
      blueWinRate: team.winrate_blue || 0,
      redWinRate: team.winrate_red || 0,
      averageGameTime: team.avg_gamelength || 0,
      // Other available stats
      firstblood_pct: team.firstblood_pct || 0,
      avg_towers: team.avg_towers || 0,
      avg_dragons: team.avg_dragons || 0,
      avg_kill_diff: team.avg_kill_diff || 0,
      avg_kills: team.avg_kills || 0,
      avg_dragons_against: team.avg_dragons_against || 0,
      avg_towers_against: team.avg_towers_against || 0,
      avg_heralds: team.avg_heralds || 0,
      avg_void_grubs: team.avg_void_grubs || 0,
      avg_golddiffat15: team.avg_golddiffat15 || 0,
      avg_xpdiffat15: team.avg_xpdiffat15 || 0,
      avg_csdiffat15: team.avg_csdiffat15 || 0
    }));
  } catch (error) {
    console.error("Exception in getAllTeams:", error);
    toast.error("An error occurred while loading teams");
    return [];
  }
};

/**
 * Gets a team by its ID
 */
export const getTeamById = async (teamId: string): Promise<Team | null> => {
  try {
    if (!teamId) {
      console.error("No team ID provided");
      return null;
    }
    
    console.log(`Getting team with ID: ${teamId}`);
    
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('teamid', teamId)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching team:", error);
      toast.error("Failed to load team details");
      return null;
    }
    
    if (!data) {
      console.log(`No team found with ID: ${teamId}`);
      return null;
    }
    
    return {
      id: data.teamid || '',
      name: data.teamname || '',
      region: data.region || '',
      logo: data.logo || '',
      winRate: data.winrate || 0,
      blueWinRate: data.winrate_blue || 0,
      redWinRate: data.winrate_red || 0,
      averageGameTime: data.avg_gamelength || 0,
      // Other available stats
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
      avg_csdiffat15: data.avg_csdiffat15 || 0
    };
  } catch (error) {
    console.error("Exception in getTeamById:", error);
    toast.error("An error occurred while fetching team details");
    return null;
  }
};
