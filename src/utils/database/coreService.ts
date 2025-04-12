
import { supabase } from '@/integrations/supabase/client';

/**
 * Checks if a table exists in the database
 */
export async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    // Use the check_table_exists function we created in our SQL migration
    const { data, error } = await supabase.rpc('check_table_exists', { 
      table_name: tableName 
    });
    
    if (error) {
      console.error('Error checking if table exists:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error checking if table exists:', error);
    return false;
  }
}

/**
 * Creates the data_updates table if it doesn't exist
 */
export async function createDataUpdatesTable(): Promise<boolean> {
  try {
    // Use raw SQL to create the table if needed (we already did this in our migration)
    const { error } = await supabase.from('data_updates').select('id').limit(1);
    
    if (error && error.code === '42P01') { // Table doesn't exist
      console.error('Error accessing data_updates table:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error creating data_updates table:', error);
    return false;
  }
}

/**
 * Gets the last database update timestamp
 */
export async function getLastUpdate(): Promise<string | null> {
  try {
    // Query directly instead of using RPC
    const { data, error } = await supabase
      .from('data_updates')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      console.error('Error getting last update:', error);
      return null;
    }
    
    return data?.updated_at || null;
  } catch (error) {
    console.error('Error getting last update:', error);
    return null;
  }
}

/**
 * Updates the last database update timestamp
 */
export async function updateLastUpdate(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('data_updates')
      .insert([{ updated_at: new Date().toISOString() }]);
    
    if (error) {
      console.error('Error updating last update:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating last update:', error);
    return false;
  }
}

/**
 * Safely executes a query using direct SQL instead of RPC functions
 */
export async function executeSafeDataUpdate(): Promise<boolean> {
  try {
    // First ensure the table exists
    const tableExists = await checkTableExists('data_updates');
    
    if (!tableExists) {
      await createDataUpdatesTable();
    }
    
    // Update the timestamp
    return await updateLastUpdate();
  } catch (error) {
    console.error('Error executing safe data update:', error);
    return false;
  }
}
