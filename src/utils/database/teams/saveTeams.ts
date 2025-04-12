
import { Team } from '@/utils/models/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { adaptTeamForDatabase } from '../adapters/teamAdapter';

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

    // Convert to database format for upsert using the adapter
    const dbTeams = teams.map(team => adaptTeamForDatabase(team));

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
