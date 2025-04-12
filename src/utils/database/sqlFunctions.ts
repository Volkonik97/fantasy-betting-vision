
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates SQL functions needed for the application
 */
export const createRequiredFunctions = async (): Promise<boolean> => {
  try {
    // Create check_table_exists function
    await supabase.rpc('create_function', {
      function_name: 'check_table_exists',
      function_body: `
        CREATE OR REPLACE FUNCTION check_table_exists(table_name text)
        RETURNS boolean
        LANGUAGE plpgsql
        AS $$
        DECLARE
          exists_check boolean;
        BEGIN
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_name = $1
          ) INTO exists_check;
          RETURN exists_check;
        END;
        $$;
      `
    });
    
    // Create data_updates table function
    await supabase.rpc('create_function', {
      function_name: 'create_data_updates_table',
      function_body: `
        CREATE TABLE IF NOT EXISTS public.data_updates (
          id SERIAL PRIMARY KEY,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
      `
    });
    
    // Create get_last_update function
    await supabase.rpc('create_function', {
      function_name: 'get_last_update',
      function_body: `
        SELECT updated_at::text
        FROM data_updates
        ORDER BY updated_at DESC
        LIMIT 1;
      `
    });
    
    // Create update_last_update function
    await supabase.rpc('create_function', {
      function_name: 'update_last_update',
      function_body: `
        INSERT INTO data_updates (updated_at)
        VALUES ($1)
        RETURNING updated_at::text;
      `,
      param_types: ['text']
    });
    
    return true;
  } catch (error) {
    console.error("Error creating SQL functions:", error);
    return false;
  }
};
