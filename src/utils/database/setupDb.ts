
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Sets up database functions and tables required for the application
 */
export async function setupDbFunctions(): Promise<boolean> {
  try {
    // Check if the data_updates table exists
    const { data: hasDataUpdates, error: dataUpdatesError } = await supabase.from('data_updates').select('id').limit(1);
    
    // If the table doesn't exist, create it
    if (dataUpdatesError && dataUpdatesError.message.includes('does not exist')) {
      const { error: createError } = await supabase.rpc('execute_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS public.data_updates (
            id SERIAL PRIMARY KEY,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
          );
        `
      });
      
      if (createError) {
        console.error('Error creating data_updates table:', createError);
        toast.error('Erreur lors de la création de la table data_updates');
        return false;
      }
    }
    
    // Successfully set up DB functions
    return true;
  } catch (error) {
    console.error('Error setting up database functions:', error);
    toast.error('Erreur lors de la configuration des fonctions de base de données');
    return false;
  }
}
