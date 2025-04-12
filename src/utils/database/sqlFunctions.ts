
import { supabase } from "@/integrations/supabase/client";

/**
 * Execute a custom SQL function on the database
 */
export const executeCustomSql = async (sql: string): Promise<{ success: boolean; error?: any }> => {
  try {
    // For security, we limit what can be executed - only allow CREATE or ALTER statements
    if (!sql.trim().toUpperCase().startsWith('CREATE') && !sql.trim().toUpperCase().startsWith('ALTER')) {
      return { 
        success: false, 
        error: "Only CREATE and ALTER statements are allowed" 
      };
    }

    // Use a generic RPC call to execute the SQL directly
    // Note: This requires appropriate permissions
    const { error } = await supabase.rpc("create_function", {
      function_name: "dynamic_sql",
      function_body: sql
    });

    if (error) {
      console.error("Error executing SQL:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error executing SQL:", error);
    return { success: false, error };
  }
};
