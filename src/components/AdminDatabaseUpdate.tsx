
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const AdminDatabaseUpdate = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);
  
  // Fetch the last update time when component mounts
  React.useEffect(() => {
    getLastUpdateTime();
  }, []);
  
  const getLastUpdateTime = async () => {
    try {
      const { data, error } = await supabase
        .from('data_updates')
        .select('updated_at')
        .order('updated_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('Error fetching last update time:', error);
        return;
      }
      
      if (data && data.length > 0) {
        setLastUpdateTime(data[0].updated_at);
      }
    } catch (error) {
      console.error('Error fetching last update time:', error);
    }
  };
  
  const triggerDatabaseUpdate = async () => {
    try {
      setIsUpdating(true);
      toast.info('Starting database update from Google Sheets...');
      
      const { data, error } = await supabase.functions.invoke('update-database', {
        method: 'POST',
        body: {},
      });
      
      if (error) {
        console.error('Error triggering database update:', error);
        toast.error(`Database update failed: ${error.message}`);
        return;
      }
      
      if (data.success) {
        toast.success(`Database updated successfully: ${data.message}`);
        getLastUpdateTime(); // Refresh the last update time
      } else {
        toast.error(`Database update failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Error triggering database update:', error);
      toast.error(`Database update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Database Management</CardTitle>
        <CardDescription>
          Update the database from Google Sheets
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-500">
            Last update: {lastUpdateTime 
              ? new Date(lastUpdateTime).toLocaleString() 
              : 'Never updated'}
          </p>
          
          <Button 
            onClick={triggerDatabaseUpdate} 
            disabled={isUpdating}
            className="w-full"
          >
            {isUpdating ? 'Updating...' : 'Update Database Now'}
          </Button>
          
          <p className="text-xs text-gray-400 mt-2">
            This will fetch data from Google Sheets and update the database.
            This process may take several minutes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminDatabaseUpdate;
