
import { supabase } from "@/integrations/supabase/client";
import { Team } from "../../models/types";
import { toast } from "sonner";
import { clearTeamsCache } from "./teamCache";
import { adaptTeamForDatabase } from "../adapters/teamAdapter";

/**
 * Save teams to the database
 */
export const saveTeams = async (teams: Team[]): Promise<boolean> => {
  try {
    if (!teams || teams.length === 0) {
      console.log("No teams to save");
      return true;
    }
    
    console.log(`Saving ${teams.length} teams to the database...`);
    
    // Map to database format
    const dbTeams = teams.map(team => adaptTeamForDatabase(team));
    
    // First, check which teams already exist to avoid conflicts
    const existingTeamIds = new Set<string>();
    const { data: existingTeams, error: checkError } = await supabase
      .from('teams')
      .select('teamid')
      .in('teamid', dbTeams.map(t => t.teamid || '').filter(Boolean));
    
    if (checkError) {
      console.error("Error checking existing teams:", checkError);
    } else if (existingTeams) {
      existingTeams.forEach(team => {
        if (team.teamid) existingTeamIds.add(team.teamid);
      });
      console.log(`Found ${existingTeamIds.size} existing teams`);
    }
    
    // Separate teams into new and existing
    const newTeams = dbTeams.filter(team => !existingTeamIds.has(team.teamid || ''));
    const existingTeamsToUpdate = dbTeams.filter(team => existingTeamIds.has(team.teamid || ''));
    
    let successCount = 0;
    let errorCount = 0;
    
    // Insert new teams
    if (newTeams.length > 0) {
      const { data: insertData, error: insertError } = await supabase
        .from('teams')
        .insert(newTeams);
        
      if (insertError) {
        console.error("Error inserting new teams:", insertError);
        errorCount += newTeams.length;
        toast.error(`Erreur lors de l'ajout de ${newTeams.length} nouvelles équipes`);
      } else {
        successCount += newTeams.length;
        console.log(`Successfully inserted ${newTeams.length} new teams`);
      }
    }
    
    // Update existing teams
    if (existingTeamsToUpdate.length > 0) {
      const { data: updateData, error: updateError } = await supabase
        .from('teams')
        .upsert(existingTeamsToUpdate, {
          onConflict: 'teamid',
          ignoreDuplicates: false
        });
        
      if (updateError) {
        console.error("Error updating existing teams:", updateError);
        errorCount += existingTeamsToUpdate.length;
        toast.error(`Erreur lors de la mise à jour de ${existingTeamsToUpdate.length} équipes existantes`);
      } else {
        successCount += existingTeamsToUpdate.length;
        console.log(`Successfully updated ${existingTeamsToUpdate.length} existing teams`);
      }
    }
    
    // Clear cache to ensure fresh data on next fetch
    clearTeamsCache();
    
    if (errorCount > 0) {
      toast.warning(`${successCount} équipes sauvegardées, ${errorCount} échecs`);
      return successCount > 0;
    } else {
      toast.success(`${successCount} équipes sauvegardées avec succès`);
      return true;
    }
  } catch (error) {
    console.error("Unexpected error in saveTeams:", error);
    toast.error("Erreur lors de la sauvegarde des équipes");
    return false;
  }
};
