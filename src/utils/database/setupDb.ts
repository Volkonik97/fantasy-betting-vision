
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Execute raw SQL
 */
export const executeSQL = async (sql: string): Promise<boolean> => {
  try {
    // This is a custom function that might not exist in all Supabase instances
    // Use direct query execution as fallback
    const { data, error } = await supabase.rpc("execute_sql", { sql_query: sql });
    
    if (error) {
      console.error("Error executing SQL:", error);
      toast.error("Erreur lors de l'exécution SQL");
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in executeSQL:", error);
    toast.error("Erreur d'exécution SQL");
    return false;
  }
};

/**
 * Check if a table exists
 */
export const checkTableExists = async (tableName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc("check_table_exists", { table_name: tableName });
    
    if (error) {
      console.error(`Error checking if table ${tableName} exists:`, error);
      return false;
    }
    
    return data || false;
  } catch (error) {
    console.error(`Error in checkTableExists for ${tableName}:`, error);
    return false;
  }
};

/**
 * Export functions for setupDbFunctions to maintain compatibility
 */
export const setupDbFunctions = {
  executeSQL,
  checkTableExists
};
