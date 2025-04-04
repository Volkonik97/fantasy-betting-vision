
import { supabase } from "@/integrations/supabase/client";
import { chunk } from '../dataConverter';
import { 
  resetCache,
} from '../csvTypes';
import { toast } from "sonner";

// Database-related functions

// Check if database has data
export const hasDatabaseData = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('count');
    
    if (error) {
      console.error("Erreur lors de la vérification des données:", error);
      return false;
    }
    
    return data && data.length > 0 && data[0].count > 0;
  } catch (error) {
    console.error("Erreur lors de la vérification des données:", error);
    return false;
  }
};

// Get the last database update timestamp
export const getLastDatabaseUpdate = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('data_updates')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1);
    
    if (error || !data || data.length === 0) {
      console.error("Erreur lors de la récupération de la date de mise à jour:", error);
      return null;
    }
    
    return data[0].updated_at || null;
  } catch (error) {
    console.error("Erreur lors de la récupération de la date de mise à jour:", error);
    return null;
  }
};

// Update the last database update timestamp
export const updateLastUpdate = async (): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('data_updates')
      .insert([{ updated_at: new Date().toISOString() }]);
    
    if (error) {
      console.error("Erreur lors de la mise à jour de la date:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la date:", error);
    return false;
  }
};

// Clear database - improved to handle foreign key constraints properly
export const clearDatabase = async (): Promise<boolean> => {
  try {
    console.log("Début de la suppression des données...");
    
    // First clear player_match_stats as it references both players and matches
    console.log("Suppression des statistiques de match des joueurs...");
    const { error: statsError } = await supabase
      .from('player_match_stats')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (statsError) {
      console.error("Erreur lors de la suppression des statistiques:", statsError);
      toast.error(`Erreur lors de la suppression des statistiques: ${statsError.message}`);
      return false;
    }
    
    // Then clear matches (depends on team_blue_id and team_red_id)
    console.log("Suppression des matchs...");
    const { error: matchesError } = await supabase
      .from('matches')
      .delete()
      .neq('id', '');
    
    if (matchesError) {
      console.error("Erreur lors de la suppression des matchs:", matchesError);
      toast.error(`Erreur lors de la suppression des matchs: ${matchesError.message}`);
      return false;
    }
    
    // Then clear players as they reference teams
    console.log("Suppression des joueurs...");
    const { error: playersError } = await supabase
      .from('players')
      .delete()
      .neq('id', '');
    
    if (playersError) {
      console.error("Erreur lors de la suppression des joueurs:", playersError);
      toast.error(`Erreur lors de la suppression des joueurs: ${playersError.message}`);
      return false;
    }
    
    // Finally clear teams
    console.log("Suppression des équipes...");
    const { error: teamsError } = await supabase
      .from('teams')
      .delete()
      .neq('id', '');
    
    if (teamsError) {
      console.error("Erreur lors de la suppression des équipes:", teamsError);
      toast.error(`Erreur lors de la suppression des équipes: ${teamsError.message}`);
      return false;
    }
    
    // Add a data update entry
    await supabase
      .from('data_updates')
      .insert([{ updated_at: new Date().toISOString() }]);
    
    // Reset the cache - properly export and use it
    resetCache();
    
    console.log("Suppression des données terminée avec succès");
    toast.success("Base de données vidée avec succès");
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression des données:", error);
    toast.error(`Erreur lors de la suppression des données: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    return false;
  }
};

// Export resetCache to make it available to other modules
export { resetCache };
