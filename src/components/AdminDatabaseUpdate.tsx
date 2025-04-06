
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
      
      // Use explicit endpoint URL with full project ID
      const functionUrl = 'https://dtddoxxazhmfudrvpszu.supabase.co/functions/v1/update-database';
      addLog('Invoking Edge Function with direct URL and explicit timeout...');
      
      // Using a promise with timeout to handle potential network issues
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Edge Function request timed out after 30 seconds')), 30000);
      });
      
      // Use fetch directly instead of supabase.functions.invoke for more direct control
      const functionPromise = fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.auth.getSession()?.data?.session?.access_token || ''}`,
        },
        body: JSON.stringify({}),
      }).then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      });
      
      // Race between function call and timeout
      const data = await Promise.race([functionPromise, timeoutPromise]) as any;
      
      if (data && data.success) {
        addLog(`Success: ${data.message}`);
        if (data.stats) {
          addLog(`Teams processed: ${data.stats.teams}`);
          addLog(`Players processed: ${data.stats.players}`);
          addLog(`Matches processed: ${data.stats.matches}`);
        }
        toast.success(`Database updated successfully: ${data.message}`);
        getLastUpdateTime(); // Refresh the last update time
      } else if (data) {
        addLog(`Failed: ${data.message || 'Unknown error'}`);
        toast.error(`Database update failed: ${data.message || 'Unknown error'}`);
      } else {
        addLog('No response data received from Edge Function');
        toast.error('Database update failed: No response data received');
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
    
    // Exponential backoff: Wait longer with each retry
    const waitTime = 3000 * Math.pow(2, nextRetryCount - 1);
    addLog(`Waiting ${waitTime / 1000} seconds before retry...`);
    
    await new Promise(resolve => setTimeout(resolve, waitTime));
    return executeDatabaseUpdate();
  };
  
  const handleUpdateError = (error: any) => {
    console.error('Error triggering database update:', error);
    
    let errorMessage = 'Unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    // Check for specific error types and provide more helpful messages
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
      errorMessage = 'Failed to connect to the update service. The Edge Function may not be deployed correctly or might be offline.';
      addLog('Error: Failed to connect to Edge Function. Please check Supabase Edge Function logs.');
      addLog('Possible solutions:');
      addLog('1. Verify the Edge Function is deployed correctly in the Supabase Dashboard');
      addLog('2. Check if CORS is properly configured in the Edge Function');
      addLog('3. Ensure the Edge Function is not timing out during execution');
      addLog('4. Check network connectivity and firewall settings');
    } else if (errorMessage.includes('timed out')) {
      addLog('Error: Edge Function request timed out. The function may be taking too long to process.');
      addLog('Possible solutions:');
      addLog('1. Check server load on your Supabase project');
      addLog('2. Optimize the Edge Function for better performance');
    } else {
      addLog(`Exception: ${errorMessage}`);
    }
    
    toast.error(`Database update failed: ${errorMessage}`);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Database Update</CardTitle>
        <CardDescription>
          Fetch and update database from Google Sheets
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
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-2 h-64 overflow-y-auto text-xs font-mono">
                {logs.map((log, index) => (
                  <div key={index} className={`py-0.5 ${
                    log.includes('Error') ? 'text-red-600 dark:text-red-400' : 
                    log.includes('Success') ? 'text-green-600 dark:text-green-400' : ''
                  }`}>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {retryCount > 0 && retryCount >= maxRetries && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md flex items-start">
              <AlertCircle className="text-amber-500 h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800 dark:text-amber-200">
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
