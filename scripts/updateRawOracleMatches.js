// scripts/updateRawOracleMatches.js
import { parseOracleCSV } from '../utils/parseOracleCSV.js'
import { insertRawMatches, getExistingMatchIds } from '../utils/supabaseClient.js'
import { logInfo, logError } from '../utils/logger.js'

const ORACLE_CSV_URL = process.env.GOOGLE_FILE_URL;

const main = async () => {
  try {
    logInfo('[updateRawOracleMatches] Lecture de la liste des gameids connus...')
    const existingGameIds = await getKnownGameIds()

    logInfo('[updateRawOracleMatches] Téléchargement et parsing du CSV Oracle...')
    const { matches } = await parseOracleCSV(ORACLE_CSV_URL, Array.from(existingGameIds))

    const newMatches = matches.filter(match => !existingGameIds.has(match.id))

    if (!newMatches.length) {
      logInfo('✅ Aucun nouveau match à importer.')
      return
    }

    await insertRawMatches(newMatches)
    logInfo(`✅ ${newMatches.length} nouveaux matchs insérés dans raw_oracle_matches.`)
  } catch (err) {
    logError('❌ Erreur dans updateRawOracleMatches :', err)
    process.exit(1)
  }
}

main()
