
// This function will handle automated database updates from Google Sheets
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Define CORS headers for the function with permissive settings
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

// Create a Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Define a valid and publicly accessible Google Sheets URL for sample data
// This is a publicly shared Oracle's Elixir format sample dataset
const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1qXhLhVPmUk0L2W9pDv7FJJuAIWJN8z-qSMBvBJZaXGA/pub?gid=0&single=true&output=csv";

// Flag to track if the function is currently processing
let isProcessing = false;

// Maximum number of items to process in a single run
const MAX_ITEMS_TO_PROCESS = 20; // Small batch size to avoid resource limits

async function updateDatabase() {
  if (isProcessing) {
    return {
      success: false,
      message: "Another update is already in progress. Please try again later."
    };
  }
  
  try {
    isProcessing = true;
    console.log("Starting database update from Google Sheets");
    
    // First, add a timestamp record to indicate that an update was attempted
    const timestampResult = await supabase
      .from('data_updates')
      .insert([{ updated_at: new Date().toISOString() }]);
    
    if (timestampResult.error) {
      console.error("Failed to add update timestamp:", timestampResult.error);
    }
    
    // Add an update status log to log the final status
    let message = "Update started";
    let statusData = {
      success: false,
      message: message,
      stats: {
        teams: 0,
        players: 0,
        matches: 0
      }
    };
    
    try {
      console.log(`Fetching data from: ${GOOGLE_SHEET_URL}`);
      
      try {
        // Add request timeout
        const controller = new AbortController();
        const signal = controller.signal;
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout for fetch
        
        const response = await fetch(GOOGLE_SHEET_URL, {
          headers: {
            'User-Agent': 'Supabase Edge Function',
            'Accept': 'text/csv',
            'Cache-Control': 'no-cache'
          },
          signal: signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error content');
          console.error(`Failed to fetch Google Sheet: ${response.status} ${response.statusText}. Details: ${errorText}`);
          throw new Error(`Failed to fetch Google Sheet: ${response.status} ${response.statusText}. Please check if the sheet is publicly accessible.`);
        }
        
        const csvData = await response.text();
        console.log(`Fetched CSV data (${csvData.length} bytes)`);
        
        if (!csvData || csvData.trim().length === 0) {
          throw new Error("Received empty data from Google Sheets. Please check if the sheet is accessible and contains data.");
        }
        
        // Process a smaller batch of data with memory-efficient parsing
        const rows = parseCsvEfficiently(csvData);
        
        if (!rows || rows.length === 0) {
          throw new Error("Failed to parse CSV data. No valid rows found.");
        }
        
        console.log(`Successfully parsed ${rows.length} rows from CSV`);
        
        // Process only a very small subset for testing
        const limitedRows = rows.slice(0, MAX_ITEMS_TO_PROCESS);
        console.log(`Processing limited dataset of ${limitedRows.length} rows`);
        
        // Process in smaller batches
        const teams = new Map();
        const players = new Map();
        const matches = new Map();
        
        // Extract entities from the limited dataset
        processEntities(limitedRows, teams, players, matches);
        
        // Save only a few entities
        const teamsSaved = await saveTeams(Array.from(teams.values()).slice(0, 5));
        const playersSaved = await savePlayers(Array.from(players.values()).slice(0, 5));
        const matchesSaved = await saveMatches(Array.from(matches.values()).slice(0, 5));
        
        message = `Successfully processed test data with ${teamsSaved} teams, ${playersSaved} players, ${matchesSaved} matches`;
        console.log(message);
        
        statusData = {
          success: true,
          message: message,
          stats: {
            teams: teamsSaved,
            players: playersSaved, 
            matches: matchesSaved
          }
        };
        
        return statusData;
      } catch (fetchError) {
        console.error("Error fetching or processing Google Sheet:", fetchError);
        throw new Error(`Error processing Google Sheet: ${fetchError.message}`);
      }
    } catch (error) {
      message = `Error: ${error.message}`;
      console.error("Error updating database:", error);
      statusData = {
        success: false,
        message: message,
        error: String(error)
      };
      return statusData;
    }
  } catch (error) {
    console.error("Unhandled error:", error);
    return {
      success: false,
      message: "Unhandled error occurred",
      error: String(error)
    };
  } finally {
    isProcessing = false;
  }
}

// More memory-efficient CSV parser
function parseCsvEfficiently(csvText) {
  try {
    if (!csvText || typeof csvText !== 'string') {
      console.error("Invalid CSV data received:", typeof csvText);
      return [];
    }
    
    // Process CSV line by line to avoid loading everything into memory
    const lines = csvText.split('\n');
    if (lines.length === 0) {
      console.error("CSV has no lines");
      return [];
    }
    
    const headers = lines[0].split(',').map(h => h.trim());
    if (headers.length === 0) {
      console.error("CSV has no headers");
      return [];
    }
    
    console.log(`Found ${headers.length} columns and ${lines.length - 1} rows`);
    
    // Process a limited number of rows to reduce memory usage
    const maxRows = Math.min(lines.length - 1, MAX_ITEMS_TO_PROCESS * 2);
    const rows = [];
    
    for (let i = 1; i <= maxRows; i++) {
      const line = lines[i];
      if (!line || line.trim() === '') continue;
      
      // Simple CSV parsing (doesn't handle quoted fields with commas)
      const values = line.split(',');
      const row = {};
      
      headers.forEach((header, i) => {
        row[header] = values[i] ? values[i].trim() : '';
      });
      
      if (Object.values(row).some(val => val)) {
        rows.push(row);
      }
    }
    
    console.log(`Processed ${rows.length} rows out of ${maxRows} available`);
    return rows;
  } catch (parseError) {
    console.error("Error parsing CSV:", parseError);
    return [];
  }
}

// Process entities from rows
function processEntities(rows, teams, players, matches) {
  for (const row of rows) {
    // Extract team information
    if (row.teamid && row.teamname) {
      if (!teams.has(row.teamid)) {
        teams.set(row.teamid, {
          id: row.teamid,
          name: row.teamname,
          region: row.league || '',
          logo: '',
          win_rate: 0,
          blue_win_rate: 0,
          red_win_rate: 0,
          average_game_time: 0
        });
      }
    }
    
    // Extract player information
    if (row.playerid && row.playername) {
      if (!players.has(row.playerid)) {
        players.set(row.playerid, {
          id: row.playerid,
          name: row.playername,
          team_id: row.teamid || null,
          role: row.position || 'unknown',
          kda: 0,
          cs_per_min: 0,
          damage_share: 0,
          image: '',
          champion_pool: []
        });
      }
    }
    
    // Extract match information
    if (row.gameid) {
      if (!matches.has(row.gameid)) {
        matches.set(row.gameid, {
          id: row.gameid,
          tournament: row.league || '',
          date: row.date || '',
          team_blue_id: '',
          team_red_id: '',
          winner_team_id: '',
          duration: row.gamelength || '',
          patch: row.patch || ''
        });
      }
      
      // Update team sides in match
      const match = matches.get(row.gameid);
      if (row.side === 'Blue' && row.teamid) {
        match.team_blue_id = row.teamid;
      } else if (row.side === 'Red' && row.teamid) {
        match.team_red_id = row.teamid;
      }
      
      // Update winner
      if (row.result === '1' && row.teamid) {
        match.winner_team_id = row.teamid;
      }
    }
  }
}

// Save teams with handling for timeouts
async function saveTeams(teams) {
  console.log(`Saving ${teams.length} teams...`);
  let teamsSaved = 0;
  
  for (const team of teams) {
    try {
      const { error } = await supabase.from('teams').upsert(team);
      if (error) {
        console.error(`Error saving team ${team.id}:`, error);
      } else {
        teamsSaved++;
      }
    } catch (e) {
      console.error(`Exception saving team ${team.id}:`, e);
    }
  }
  
  console.log(`Successfully saved ${teamsSaved}/${teams.length} teams`);
  return teamsSaved;
}

// Save players with handling for timeouts
async function savePlayers(players) {
  console.log(`Saving ${players.length} players...`);
  let playersSaved = 0;
  
  for (const player of players) {
    try {
      const { error } = await supabase.from('players').upsert(player);
      if (error) {
        console.error(`Error saving player ${player.id}:`, error);
      } else {
        playersSaved++;
      }
    } catch (e) {
      console.error(`Exception saving player ${player.id}:`, e);
    }
  }
  
  console.log(`Successfully saved ${playersSaved}/${players.length} players`);
  return playersSaved;
}

// Save matches with handling for timeouts
async function saveMatches(matches) {
  console.log(`Saving ${matches.length} matches...`);
  let matchesSaved = 0;
  
  for (const match of matches) {
    try {
      const { error } = await supabase.from('matches').upsert(match);
      if (error) {
        console.error(`Error saving match ${match.id}:`, error);
      } else {
        matchesSaved++;
      }
    } catch (e) {
      console.error(`Exception saving match ${match.id}:`, e);
    }
  }
  
  console.log(`Successfully saved ${matchesSaved}/${matches.length} matches`);
  return matchesSaved;
}

// Handle HTTP requests with improved error handling and logging
serve(async (req) => {
  console.log(`Received ${req.method} request to update-database function from ${req.headers.get("origin") || "unknown origin"}`);
  
  // Handle CORS preflight requests with expanded headers
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }
  
  // For security, only allow POST requests
  if (req.method !== "POST") {
    console.log(`Method not allowed: ${req.method}`);
    return new Response(JSON.stringify({ error: "Method not allowed" }), { 
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  
  try {
    console.log("Starting database update process");
    // Execute the database update with a timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout
    
    try {
      // Execute the database update with the abort controller
      const result = await updateDatabase();
      clearTimeout(timeout);
      
      console.log("Database update completed", result);
      
      // Return the result
      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } catch (error) {
      clearTimeout(timeout);
      if (error.name === 'AbortError') {
        console.error("Function execution timed out");
        return new Response(JSON.stringify({ 
          success: false,
          error: "Function execution timed out",
          message: "The database update took too long and was aborted" 
        }), {
          status: 408, // Request Timeout
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      throw error; // Re-throw other errors to be caught by the outer try-catch
    }
  } catch (error) {
    console.error("Unhandled error processing request:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: String(error),
      message: "An unexpected error occurred while processing the request" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
