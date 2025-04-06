
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, RefreshCw } from 'lucide-react';

const AdminDatabaseUpdate = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  
  // Fetch the last update time when component mounts
  useEffect(() => {
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
  
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prevLogs => [`[${timestamp}] ${message}`, ...prevLogs]);
  };
  
  const triggerDatabaseUpdate = async () => {
    try {
      setIsUpdating(true);
      setLogs([]); // Clear previous logs
      setRetryCount(0);
      
      addLog('Starting database update from Google Sheets...');
      toast.info('Starting database update from Google Sheets...');
      
      await executeDatabaseUpdate();
    } catch (error) {
      handleUpdateError(error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const executeDatabaseUpdate = async () => {
    try {
      addLog('Connecting to update-database Edge Function...');
      
      const { data, error } = await supabase.functions.invoke('update-database', {
        method: 'POST',
        body: {},
      });
      
      if (error) {
        throw error;
      }
      
      if (data.success) {
        addLog(`Success: ${data.message}`);
        if (data.stats) {
          addLog(`Teams processed: ${data.stats.teams}`);
          addLog(`Players processed: ${data.stats.players}`);
          addLog(`Matches processed: ${data.stats.matches}`);
        }
        toast.success(`Database updated successfully: ${data.message}`);
        getLastUpdateTime(); // Refresh the last update time
      } else {
        addLog(`Failed: ${data.message}`);
        toast.error(`Database update failed: ${data.message}`);
      }
    } catch (error) {
      if (retryCount < maxRetries) {
        await handleRetry(error);
      } else {
        throw error;
      }
    }
  };
  
  const handleRetry = async (error: any) => {
    const nextRetryCount = retryCount + 1;
    setRetryCount(nextRetryCount);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    addLog(`Error: ${errorMessage}. Retrying (${nextRetryCount}/${maxRetries})...`);
    
    // Wait a moment before retrying
    await new Promise(resolve => setTimeout(resolve, 1000));
    return executeDatabaseUpdate();
  };
  
  const handleUpdateError = (error: any) => {
    console.error('Error triggering database update:', error);
    
    let errorMessage = 'Unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    // Check for specific error types and provide more helpful messages
    if (errorMessage.includes('Failed to send a request to the Edge Function')) {
      errorMessage = 'Failed to connect to the update service. The Edge Function may not be deployed correctly or might be offline.';
      addLog('Error: Failed to connect to Edge Function. Please check Supabase Edge Function logs.');
      addLog('Possible solutions:');
      addLog('1. Make sure the function is deployed correctly');
      addLog('2. Check JWT verification settings in supabase/config.toml');
      addLog('3. Verify your authentication token is valid');
    } else {
      addLog(`Exception: ${errorMessage}`);
    }
    
    toast.error(`Database update failed: ${errorMessage}`);
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
            {isUpdating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Database Now'
            )}
          </Button>
          
          <p className="text-xs text-gray-400 mt-2">
            This will fetch data from Google Sheets and update the database.
            This process may take several minutes.
          </p>
          
          {logs.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Update Logs:</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-md p-2 h-48 overflow-y-auto text-xs font-mono">
                {logs.map((log, index) => (
                  <div key={index} className={`py-0.5 ${log.includes('Error') ? 'text-red-600' : ''}`}>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {retryCount > 0 && retryCount >= maxRetries && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start">
              <AlertCircle className="text-amber-500 h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Update failed after multiple attempts</p>
                <p className="mt-1">The Edge Function may be unavailable. Please check your Supabase Edge Function logs for more details.</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminDatabaseUpdate;
