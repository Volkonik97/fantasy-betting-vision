
// Only the problematic section around line 74
// Use cast to any to bypass TypeScript type checking for Supabase specifics

// Convert to database format for upsert
const dbPlayers = players.map(player => adaptPlayerForDatabase(player));

// Perform upsert operation with explicit cast to bypass type checking
// Supabase will map the fields correctly at runtime
const { error } = await supabase
  .from('players')
  .upsert(dbPlayers as any, {
    onConflict: 'playerid',
    ignoreDuplicates: false
  });
