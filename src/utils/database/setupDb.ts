
import { supabase } from "@/integrations/supabase/client";

/**
 * Initialise les fonctions RPC nécessaires pour l'application
 * Cette fonction devrait être appelée une fois lors du démarrage de l'application
 */
export const setupDbFunctions = async (): Promise<void> => {
  try {
    // Créer la fonction check_table_exists
    await supabase.rpc('create_check_table_exists_function');
    
    // Créer la fonction create_data_updates_table
    await supabase.rpc('create_data_updates_table_function');
    
    // Créer la fonction get_last_update
    await supabase.rpc('create_get_last_update_function');
    
    // Créer la fonction update_last_update
    await supabase.rpc('create_update_last_update_function');
    
    console.log("Fonctions RPC initialisées avec succès");
  } catch (error) {
    console.error("Erreur lors de l'initialisation des fonctions RPC:", error);
  }
};

// Exporter d'autres fonctions d'initialisation si nécessaire
