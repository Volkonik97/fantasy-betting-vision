
import { Team } from '@/utils/models/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Save teams to the database
 * Uses upsert to update existing teams and insert new ones
 */
export const saveTeams = async (teams: Team[]): Promise<boolean> => {
  try {
    if (!teams || teams.length === 0) {
      console.log("No teams to save");
      return true;
    }

    console.log(`Saving ${teams.length} teams to database`);

    // Convert to database format for upsert
    const dbTeams = teams.map(team => ({
      teamid: team.id,
      teamname: team.name,
      logo: team.logo || null,
      region: team.region || 'Unknown',
      winrate: team.win_rate || 0,
      winrate_blue: team.blue_win_rate || 0,
      winrate_red: team.red_win_rate || 0,
      avg_gamelength: team.average_game_time || 0,
      firstblood_pct: team.firstblood_pct || 0,
      firstblood_blue_pct: team.blueFirstBlood || 0,
      firstblood_red_pct: team.redFirstBlood || 0,
      firstdragon_pct: team.firstdragon_pct || 0,
      avg_dragons: team.avg_dragons || 0,
      avg_dragons_against: team.avg_dragons_against || 0,
      avg_towers: team.avg_towers || 0,
      avg_towers_against: team.avg_towers_against || 0,
      avg_kills: team.avg_kills || 0,
      avg_kill_diff: team.avg_kill_diff || 0,
      avg_heralds: team.avg_heralds || 0,
      avg_void_grubs: team.avg_void_grubs || 0
    }));

    // Use cast to bypass type checking for Supabase
    const { error } = await supabase
      .from('teams')
      .upsert(dbTeams as any, {
        onConflict: 'teamid',
        ignoreDuplicates: false
      });

    if (error) {
      console.error("Error saving teams:", error);
      toast.error("Error saving teams to database");
      return false;
    }

    console.log(`Successfully saved ${teams.length} teams`);
    return true;
  } catch (error) {
    console.error("Exception in saveTeams:", error);
    toast.error("Failed to save teams");
    return false;
  }
};
