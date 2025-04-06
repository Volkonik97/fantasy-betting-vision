// This function will handle automated database updates from Google Sheets
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Define CORS headers for the function with permissive settings
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

// Create a Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Define the Google Sheets URL to fetch data from
const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/17G8ainh2efXGPAlPYQKj0NCji4hh9qhj41A8LbrlzuE/export?format=csv";

async function updateDatabase() {
  try {
    console.log("Starting database update from Google Sheets");
    
    // Fetch the CSV data from Google Sheets
    console.log(`Fetching data from: ${GOOGLE_SHEET_URL}`);
    const response = await fetch(GOOGLE_SHEET_URL, {
      headers: {
        'User-Agent': 'Supabase Edge Function',
        'Accept': 'text/csv',
      },
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch Google Sheet: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch Google Sheet: ${response.status} ${response.statusText}`);
    }
    
    const csvData = await response.text();
    console.log(`Fetched CSV data (${csvData.length} bytes)`);
    
    // Parse the CSV data
    const rows = parseCsv(csvData);
    console.log(`Parsed ${rows.length} rows from CSV`);
    
    if (rows.length === 0) {
      throw new Error("No data found in Google Sheet");
    }
    
    // Clear existing data (optional, based on your requirements)
    await clearExistingData();
    
    // Process and insert the data
    const result = await processAndSaveData(rows);
    
    return {
      success: true,
      message: `Successfully updated database with ${result.teams} teams, ${result.players} players, ${result.matches} matches`,
      stats: result
    };
  } catch (error) {
    console.error("Error updating database:", error);
    return {
      success: false,
      message: error.message,
      error: String(error)
    };
  }
}

// Simple CSV parser function for Deno
function parseCsv(csvText) {
  const lines = csvText.split('\n');
  if (lines.length === 0) {
    return [];
  }
  
  const headers = lines[0].split(',').map(h => h.trim());
  if (headers.length === 0) {
    return [];
  }
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const row = {};
    
    headers.forEach((header, i) => {
      row[header] = values[i] ? values[i].trim() : '';
    });
    
    return row;
  }).filter(row => Object.values(row).some(val => val)); // Filter out empty rows
}

// Clear existing data
async function clearExistingData() {
  console.log("Clearing existing data...");
  
  const tables = [
    'player_match_stats',
    'team_match_stats',
    'matches',
    'players',
    'teams'
  ];
  
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).delete().not('id', 'is', null);
      if (error) {
        console.error(`Error clearing ${table}:`, error);
        throw new Error(`Failed to clear ${table}: ${error.message}`);
      }
      console.log(`Successfully cleared ${table} table`);
    } catch (e) {
      console.error(`Exception clearing ${table}:`, e);
      throw e;
    }
  }
  
  console.log("Successfully cleared existing data");
}

// Process and save data
async function processAndSaveData(rows) {
  // This is a simplified version of your existing processLeagueData function
  // In a real implementation, you would need to port the entire logic
  
  // Group data by teams, players, matches
  const teams = new Map();
  const players = new Map();
  const matches = new Map();
  
  // Process rows to extract entities
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
  
  // Save teams
  console.log(`Saving ${teams.size} teams...`);
  let teamsSaved = 0;
  for (const team of teams.values()) {
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
  console.log(`Successfully saved ${teamsSaved}/${teams.size} teams`);
  
  // Save players
  console.log(`Saving ${players.size} players...`);
  let playersSaved = 0;
  for (const player of players.values()) {
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
  console.log(`Successfully saved ${playersSaved}/${players.size} players`);
  
  // Save matches
  console.log(`Saving ${matches.size} matches...`);
  let matchesSaved = 0;
  for (const match of matches.values()) {
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
  console.log(`Successfully saved ${matchesSaved}/${matches.size} matches`);
  
  // Update timestamp
  try {
    await supabase.from('data_updates').insert([{ updated_at: new Date().toISOString() }]);
    console.log("Added update timestamp to data_updates table");
  } catch (e) {
    console.error("Error adding update timestamp:", e);
  }
  
  return {
    teams: teams.size,
    players: players.size,
    matches: matches.size,
    teamsSaved,
    playersSaved,
    matchesSaved
  };
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
    // Execute the database update
    const result = await updateDatabase();
    
    console.log("Database update completed", result);
    
    // Return the result
    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
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
