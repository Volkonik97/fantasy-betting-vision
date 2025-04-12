
import { supabase } from "@/integrations/supabase/client";
import { chunk } from '../dataConverter';
import { resetCache } from '../csv/cache/dataCache';
import { toast } from "sonner";

// Créer la table data_updates si elle n'existe pas
const createDataUpdatesTableIfNeeded = async (): Promise<boolean> => {
  try {
    // Vérifier si la table existe
    const { data, error } = await supabase
      .rpc('check_table_exists', { table_name: 'data_updates' });
    
    if (error) {
      console.error("Erreur lors de la vérification de la table data_updates:", error);
      return false;
    }
    
    // Si la table n'existe pas, la créer
    if (!data) {
      const { error: createError } = await supabase.rpc('create_data_updates_table');
      
      if (createError) {
        console.error("Erreur lors de la création de la table data_updates:", createError);
        return false;
      }
      
      console.log("Table data_updates créée avec succès");
    }
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la vérification/création de la table data_updates:", error);
    return false;
  }
};

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
    await createDataUpdatesTableIfNeeded();
    
    const { data, error } = await supabase
      .rpc('get_last_update');
    
    if (error || !data) {
      console.error("Erreur lors de la récupération de la date de mise à jour:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération de la date de mise à jour:", error);
    return null;
  }
};

// Update the last database update timestamp
export const updateLastUpdate = async (): Promise<boolean> => {
  try {
    await createDataUpdatesTableIfNeeded();
    
    const { error } = await supabase
      .rpc('update_last_update', { update_time: new Date().toISOString() });
    
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
      .neq('id', 0);
    
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
      .neq('gameid', '');
    
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
      .neq('playerid', '');
    
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
      .neq('teamid', '');
    
    if (teamsError) {
      console.error("Erreur lors de la suppression des équipes:", teamsError);
      toast.error(`Erreur lors de la suppression des équipes: ${teamsError.message}`);
      return false;
    }
    
    // Update the last update timestamp
    await updateLastUpdate();
    
    // Reset the cache
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
