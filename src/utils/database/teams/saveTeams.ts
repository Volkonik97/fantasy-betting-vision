
// The relevant part around line 50
// Use cast to bypass type checking for Supabase

// Upsert teams with proper typing
const { error } = await supabase
  .from('teams')
  .upsert(dbTeams as any, {
    onConflict: 'teamid',
    ignoreDuplicates: false
  });
