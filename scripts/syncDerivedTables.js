// scripts/syncDerivedTables.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const main = async () => {
  console.log('[syncDerivedTables] Appel de regenerate_all_tables()...');
  const { error } = await supabase.rpc('regenerate_all_tables');

  if (error) {
    console.error('Erreur lors de l’appel de regenerate_all_tables :', error);
    process.exit(1);
  }

  console.log('[syncDerivedTables] Tables mises à jour avec succès ✅');
};

main();
