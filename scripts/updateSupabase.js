const { supabase } = require('../utils/supabaseClient');
const { downloadAndParseCSV } = require('../utils/parseCSV');
const { log } = require('../utils/logger');

const FILE_ID = process.env.GOOGLE_FILE_ID;

async function main() {
  log('🚀 Début import automatique');

  const rows = await downloadAndParseCSV(FILE_ID);
  log(`✅ ${rows.length} lignes récupérées du CSV`);

  // Récupère les gameid existants
  const { data: existingMatches, error } = await supabase
    .from('matches')
    .select('gameid');

  if (error) throw new Error(`Erreur récupération matchs existants: ${error.message}`);

  const existingGameIds = new Set(existingMatches.map(match => match.gameid));

  const newRows = rows.filter(row => {
    return !existingGameIds.has(row.gameid)
      && row.teamname !== 'Unknown Team'
      && row.teamname_1 !== 'Unknown Team'
      && row.teamname_2 !== 'Unknown Team';
  });

  log(`🎯 ${newRows.length} nouvelles lignes prêtes à être insérées.`);

  if (newRows.length === 0) {
    log('⚠️ Aucune nouvelle ligne à ajouter.');
    return;
  }

  const { error: insertError } = await supabase
    .from('matches')
    .insert(newRows);

  if (insertError) {
    log(`❌ Erreur lors de l'insertion : ${insertError.message}`);
  } else {
    log('🎉 Insertion réussie des nouvelles lignes.');
  }
}

main().catch(err => log('🚨 Erreur globale :', err));
