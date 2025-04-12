
import { supabase } from '@/integrations/supabase/client';

/**
 * Execute a SQL query using supabase SQL API
 */
export async function executeSql(query: string): Promise<any> {
  try {
    const { data, error } = await supabase.rpc('execute_sql', { sql_query: query });
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error executing SQL:', error);
    throw error;
  }
}

/**
 * Create a database function
 */
export async function createDatabaseFunction(functionName: string, functionBody: string): Promise<boolean> {
  try {
    // Use raw SQL for creating functions since the RPC may not exist yet
    const { error } = await executeSql(functionBody);
    
    if (error) {
      console.error(`Error creating function ${functionName}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error creating function ${functionName}:`, error);
    return false;
  }
}

/**
 * Check if a database function exists
 */
export async function checkFunctionExists(functionName: string): Promise<boolean> {
  try {
    const { data, error } = await executeSql(`
      SELECT count(*) > 0 as exists
      FROM pg_proc 
      JOIN pg_namespace ON pg_namespace.oid = pg_proc.pronamespace
      WHERE proname = '${functionName}'
        AND nspname = 'public'
    `);
    
    if (error) {
      console.error(`Error checking if function ${functionName} exists:`, error);
      return false;
    }
    
    return data?.[0]?.exists || false;
  } catch (error) {
    console.error(`Error checking if function ${functionName} exists:`, error);
    return false;
  }
}
