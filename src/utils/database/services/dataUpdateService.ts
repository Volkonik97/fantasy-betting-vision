
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Update the last data update timestamp
export const updateTimestamp = async (): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('data_updates')
      .upsert([{ id: 1, updated_at: new Date().toISOString() }]);
      
    if (error) {
      console.error('Error updating timestamp:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating timestamp:', error);
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
      .limit(1)
      .single();
      
    if (error || !data) {
      console.error('Error getting last update timestamp:', error);
      return null;
    }
    
    return data.updated_at;
  } catch (error) {
    console.error('Error getting last update timestamp:', error);
    return null;
  }
};
