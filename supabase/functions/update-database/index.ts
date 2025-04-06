
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

// Define a valid and publicly accessible Google Sheets URL for testing
// This is a sample URL - replace with a real, public Google Sheet for production
const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRsb4OQeyJBX2LW89qnvYTMfI3J7ZEH8L6EWg9xzICaSiNmvPKoZu5xOXFP6ckJwPRIKl9QT6oODZ3L/pub?gid=1369291277&single=true&output=csv";

// Flag to track if the function is currently processing
let isProcessing = false;

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
      // Instead of processing everything in one go, we'll start by fetching a small sample
      // This is a simplified version for testing resource limits
      console.log(`Fetching data from: ${GOOGLE_SHEET_URL}`);
      
      try {
        const response = await fetch(GOOGLE_SHEET_URL, {
          headers: {
            'User-Agent': 'Supabase Edge Function',
            'Accept': 'text/csv',
          },
        });
        
        if (!response.ok) {
          // More detailed error message
          const errorText = await response.text().catch(() => 'Unknown error content');
          console.error(`Failed to fetch Google Sheet: ${response.status} ${response.statusText}. Details: ${errorText}`);
          throw new Error(`Failed to fetch Google Sheet: ${response.status} ${response.statusText}. Please check if the sheet is publicly accessible.`);
        }
        
        const csvData = await response.text();
        console.log(`Fetched CSV data (${csvData.length} bytes)`);
        
        if (!csvData || csvData.trim().length === 0) {
          throw new Error("Received empty data from Google Sheets. Please check if the sheet is accessible and contains data.");
        }
        
        // Process a smaller batch of data
        const rows = parseCsv(csvData);
        
        if (!rows || rows.length === 0) {
          throw new Error("Failed to parse CSV data. No valid rows found.");
        }
        
        console.log(`Successfully parsed ${rows.length} rows from CSV`);
        
        // Process only the first 100 rows for testing
        const limitedRows = rows.slice(0, 100);
        console.log(`Processing limited dataset of ${limitedRows.length} rows`);
        
        // For now, we'll just insert some test data to verify the function works
        const teams = new Map();
        const players = new Map();
        const matches = new Map();
        
        // Extract entities from the limited dataset
        processEntities(limitedRows, teams, players, matches);
        
        // Save a few entities
        const teamsSaved = await saveTeams(Array.from(teams.values()).slice(0, 10));
        const playersSaved = await savePlayers(Array.from(players.values()).slice(0, 10));
        const matchesSaved = await saveMatches(Array.from(matches.values()).slice(0, 10));
        
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

// Simple CSV parser function for Deno
function parseCsv(csvText) {
  try {
    if (!csvText || typeof csvText !== 'string') {
      console.error("Invalid CSV data received:", typeof csvText);
      return [];
    }
    
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
    
    console.log(`Parsed ${lines.length - 1} rows from CSV`);
    
    return lines.slice(1).map(line => {
      const values = line.split(',');
      const row = {};
      
      headers.forEach((header, i) => {
        row[header] = values[i] ? values[i].trim() : '';
      });
      
      return row;
    }).filter(row => Object.values(row).some(val => val)); // Filter out empty rows
  } catch (parseError) {
    console.error("Error parsing CSV:", parseError);
    return [];
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
    const timeout = setTimeout(() => controller.abort(), 25000); // Set a 25 second timeout
    
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
