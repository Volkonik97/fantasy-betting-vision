
import { supabase } from "@/integrations/supabase/client";
import { createRequiredFunctions } from "./sqlFunctions";

/**
 * Initialise les fonctions RPC nécessaires pour l'application
 * Cette fonction devrait être appelée une fois lors du démarrage de l'application
 */
export const setupDbFunctions = async (): Promise<void> => {
  try {
    // Vérifier si la table data_updates existe, sinon la créer
    const { data: tableExists, error: checkError } = await supabase
      .from('data_updates')
      .select('count(*)')
      .limit(1)
      .single();
    
    // Si on a une erreur c'est que la table n'existe probablement pas
    if (checkError) {
      console.log("La table data_updates n'existe pas encore, création en cours...");
      
      // Créer la table data_updates
      const { error: createTableError } = await supabase.rpc('create_function', {
        function_name: 'create_data_updates_function',
        function_body: `
          CREATE TABLE IF NOT EXISTS public.data_updates (
            id SERIAL PRIMARY KEY,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
          );
        `
      });
      
      if (createTableError) {
        console.error("Erreur lors de la création de la table data_updates:", createTableError);
      } else {
        console.log("Table data_updates créée avec succès");
      }
    }
    
    // Initialiser les fonctions SQL
    await createRequiredFunctions();
    
    console.log("Fonctions RPC initialisées avec succès");
  } catch (error) {
    console.error("Erreur lors de l'initialisation des fonctions RPC:", error);
  }
};

// Exporter d'autres fonctions d'initialisation si nécessaire
