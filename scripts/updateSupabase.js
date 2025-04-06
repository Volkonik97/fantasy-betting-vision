import { parseCSV } from '../utils/parseOracleCSV.js'; // Si tu es dans le dossier 'scripts'
import { supabase } from '../utils/supabaseClient.js';
import { log, logError, logMatchIgnored, logMatchImported } from '../utils/logger.js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const GOOGLE_FILE_ID = process.env.GOOGLE_FILE_ID;

log(`🔒 SUPABASE_URL: ${SUPABASE_URL ? '✅' : '❌'}`);
log(`🔒 SUPABASE_KEY: ${SUPABASE_KEY ? '✅' : '❌'}`);
log(`🔒 GOOGLE_FILE_ID: ${GOOGLE_FILE_ID ? '✅' : '❌'}`);

if (!SUPABASE_URL || !SUPABASE_KEY || !GOOGLE_FILE_ID) {
  throw new Error("❌ Erreur : un ou plusieurs secrets manquent.");
}

const main = async () => {
  try {
    const {
      validMatches,
      ignoredMatches,
      allMatchIdsInSupabase,
      newMatches,
    } = await parseCSVFile(GOOGLE_FILE_ID);

    for (const id of ignoredMatches) {
      logMatchIgnored(id);
    }

    log(`🧩 Matchs uniques valides trouvés : ${validMatches.length}`);
    log(`🧠 Matchs trouvés dans Supabase (réels) : ${allMatchIdsInSupabase.length}`);
    log(`🆕 Nouveaux matchs à importer : ${newMatches.length}`);

    if (newMatches.length > 0) {
      log(`🧾 Liste des gameid considérés comme nouveaux :`);
      newMatches.forEach(m => log(`➡️ ${m.gameid}`));
    }

    for (const match of newMatches) {
      try {
        await supabase.from('matches').insert(match.matchesRow);
        for (const stat of match.teamStatsRows) {
          await supabase.from('team_match_stats').insert(stat);
        }
        for (const stat of match.playerStatsRows) {
          await supabase.from('player_match_stats').insert(stat);
        }
        logMatchImported(match.gameid);
      } catch (e) {
        logError(`Erreur insertion match ${match.gameid}: ${e.message}`);
      }
    }

    if (newMatches.length > 0) {
      await supabase.from('data_updates').upsert({
        source: 'oracle',
        last_updated: new Date().toISOString(),
      });
      log("📌 data_updates mise à jour.");
    }

    if (newMatches.length === 0) {
      log("🎉 Aucun nouveau match à importer aujourd'hui.");
    }

  } catch (e) {
    logError(`Erreur générale : ${e.message}`);
    process.exit(1);
  }
};

main();
