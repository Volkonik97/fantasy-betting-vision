// scripts/updateRawOracleMatches.js
import { fetchAndParseCSV } from '../utils/parseOracleCSV.js';
import { insertRawMatches, getKnownGameIds } from '../utils/supabaseClient.js';
import { logInfo, logError } from '../utils/logger.js';

const main = async () => {
  try {
    const parsedRows = await fetchAndParseCSV();
    if (!parsedRows.length) {
      logInfo('Aucune ligne trouvée dans le fichier CSV.');
      return;
    }

    const existingGameIds = await getKnownGameIds();
    const newRows = parsedRows.filter(row => !existingGameIds.has(row.gameid));

    if (!newRows.length) {
      logInfo('Aucun nouveau match à importer.');
      return;
    }

    await insertRawMatches(newRows);
    logInfo(`${newRows.length} nouveaux matchs ajoutés à raw_oracle_matches.`);
  } catch (err) {
    logError('Erreur lors de l’importation des matchs Oracle:', err);
  }
};

main();
