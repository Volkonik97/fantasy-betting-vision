
import { supabase } from '@/integrations/supabase/client';

/**
 * Checks if a table exists in the database
 */
export async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    // Use a direct SQL query to check if the table exists
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
    const { error } = await supabase.rpc('create_data_updates_table');
    
    if (error) {
      console.error('Error creating data_updates table:', error);
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
    const { data, error } = await supabase.rpc('get_last_update');
    
    if (error) {
      console.error('Error getting last update:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting last update:', error);
    return null;
  }
}

/**
 * Updates the last database update timestamp
 */
export async function updateLastUpdate(timestamp: string = new Date().toISOString()): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc('update_last_update', { 
      timestamp: timestamp 
    });
    
    if (error) {
      console.error('Error updating last update:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error updating last update:', error);
    return null;
  }
}

/**
 * Safely executes a query using a direct RPC function
 * (This is an alternative to working with data_updates table directly)
 */
export async function executeSafeDataUpdate(timestamp: string = new Date().toISOString()): Promise<boolean> {
  try {
    // First ensure the table exists
    const tableExists = await checkTableExists('data_updates');
    
    if (!tableExists) {
      await createDataUpdatesTable();
    }
    
    // Update the timestamp
    const result = await updateLastUpdate(timestamp);
    
    return !!result;
  } catch (error) {
    console.error('Error executing safe data update:', error);
    return false;
  }
}
