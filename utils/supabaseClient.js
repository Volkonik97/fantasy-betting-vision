import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export const getKnownGameIds = async () => {
  const { data, error } = await supabase
    .from('raw_oracle_matches')
    .select('gameid');
  if (error) throw error;
  return new Set(data.map(row => row.gameid));
};

export const insertRawMatches = async (rows) => {
  const { error } = await supabase
    .from('raw_oracle_matches')
    .insert(rows);
  if (error) throw error;
};

export const regenerateDerivedTables = async () => {
  const { error } = await supabase.rpc('regenerate_all_tables');
  if (error) throw error;
};
