import { createClient } from '@supabase/supabase-js';

function checkEnv() {
  const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  for (const name of required) {
    if (!process.env[name]) {
      console.error(`❌ Variable d'environnement manquante : ${name}`);
      process.exit(1);
    }
  }
}

checkEnv();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function regenerateAll() {
  console.log('[LOG] 🔁 Exécution de la fonction SQL `regenerate_all_tables()`...');
  const { error } = await supabase.rpc('regenerate_all_tables');
  if (error) {
    console.error('❌ Erreur lors de l’exécution de regenerate_all_tables :', error);
    process.exit(1);
  } else {
    console.log('✅ Tables dérivées mises à jour avec succès.');
  }
}

regenerateAll();
