
import { supabase } from "@/integrations/supabase/client";
import { chunk } from '../dataConverter';
import { 
  resetCache,
} from '../csvTypes';

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

// Clear database
export const clearDatabase = async (): Promise<boolean> => {
  try {
    // Supprimer d'abord les tables avec des références (dans l'ordre)
    await supabase.from('matches').delete().gt('id', '');
    await supabase.from('players').delete().gt('id', '');
    await supabase.from('teams').delete().gt('id', '');
    
    // Ajouter une entrée dans la table des mises à jour
    await supabase.from('data_updates').insert([{ updated_at: new Date().toISOString() }]);
    
    // Réinitialiser le cache
    resetCache();
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression des données:", error);
    return false;
  }
};
