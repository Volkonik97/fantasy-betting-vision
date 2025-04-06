
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, RefreshCw, AlertTriangle, Info, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

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
      
      try {
        // Using a plain fetch call with a timeout
        const controller = new AbortController();
        const signal = controller.signal;
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 seconds timeout
        
        // Get the auth session
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token || '';
        
        // Perform the fetch with more informative errors
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({}),
          signal: signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const statusCode = response.status;
          
          // Special case for resource limit errors (code 546)
          if (statusCode === 546) {
            throw new Error(`HTTP error! status: ${statusCode}. The Edge Function has reached resource limits. Try again with a smaller dataset.`);
          }
          
          // Try to parse error response
          const errorText = await response.text().catch(() => 'Unknown error');
          let errorMessage = `HTTP error! status: ${statusCode}. `;
          
          try {
            const errorObj = JSON.parse(errorText);
            errorMessage += errorObj.message || errorObj.error || errorText;
          } catch (e) {
            errorMessage += errorText;
          }
          
          throw new Error(errorMessage);
        }
        
        // Parse the response
        const data = await response.json();
        
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
        if (error.name === 'AbortError') {
          throw new Error('Edge Function request timed out after 20 seconds');
        }
        throw error;
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
    if (errorMessage.includes('546')) {
      errorMessage = 'The Edge Function has reached CPU or memory limits. The function is configured to process only small batches of data. Please try again.';
      addLog('Error: Edge Function reached resource limits.');
      addLog('The function is configured to process small batches of data.');
      addLog('Please try again in a moment.');
    } else if (errorMessage.includes('400 Bad Request') && errorMessage.includes('Google Sheet')) {
      errorMessage = 'Failed to fetch Google Sheet: The sheet might not be publicly accessible or the URL is incorrect.';
      addLog('Error: Failed to access Google Sheet. Please check:');
      addLog('1. The Google Sheet exists and is publicly accessible');
      addLog('2. The URL in the Edge Function is correct');
      addLog('3. The sheet has the correct data format (Oracle\'s Elixir format)');
    } else if (errorMessage.includes('404 Not Found')) {
      errorMessage = 'The Google Sheet could not be found. The URL might be incorrect or the sheet no longer exists.';
      addLog('Error: Google Sheet not found (404 error).');
      addLog('The Edge Function is now configured to use a sample sheet.');
      addLog('Please try again or contact the administrator.');
    } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
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
      addLog('2. The Edge Function has been configured to process smaller batches of data');
      addLog('3. Try again later when the server is less busy');
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
          
          <Alert className="bg-blue-50 border-blue-200 mb-4">
            <Info className="text-blue-500 h-5 w-5 mr-2" />
            <AlertTitle>Demo Mode Active</AlertTitle>
            <AlertDescription className="text-blue-700 text-sm">
              The Edge Function is currently set to process a very small subset of data (only {20} rows) 
              to avoid resource limits. This is perfect for testing but will not load the full dataset. 
              For production, this would need to be expanded to handle larger batches or implement a chunking mechanism.
            </AlertDescription>
          </Alert>
          
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
            <div className="flex items-start">
              <AlertTriangle className="text-amber-500 h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-800 font-medium">Google Sheet Configuration</p>
                <p className="text-xs text-amber-700 mt-1">
                  The Edge Function is now using a stable, publicly available sample dataset.
                  No configuration needed - just click the update button below.
                </p>
              </div>
            </div>
          </div>
          
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
            This will fetch data from a sample Google Sheet and update the database.
            The Edge Function has been optimized to handle only small batches of data.
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
                <p className="mt-1">The Edge Function has been optimized to handle smaller batches of data. Please try again later.</p>
              </div>
            </div>
          )}

          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
            <div className="flex items-start">
              <Info className="text-gray-500 h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-700 font-medium">Resources</p>
                <div className="mt-2 text-xs text-gray-600">
                  <a 
                    href="https://www.kaggle.com/datasets/jasperan/league-of-legends-esports-dataset?resource=download" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center hover:text-blue-600 transition-colors"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Oracle's Elixir LoL Dataset on Kaggle
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminDatabaseUpdate;
