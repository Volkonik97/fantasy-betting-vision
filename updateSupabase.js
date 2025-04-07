import { fetchCSVAndParse } from './utils/parseOracleCSV.js'
import { insertDataToSupabase, getExistingMatchIds } from './utils/supabaseClient.js'
import { logInfo, logError } from './utils/logger.js'

const SHEET_URL = process.env.GOOGLE_FILE_URL;

const main = async () => {
  try {
    logInfo('🟡 Démarrage de l\'import automatique depuis Google Sheet...')

    if (!SHEET_URL) {
      throw new Error('SHEET_URL (GOOGLE_FILE_URL) is not defined.')
    }

    logInfo(`🌍 URL utilisée : ${SHEET_URL}`)

    const rows = await fetchCSVAndParse(SHEET_URL)
    logInfo(`📊 Nombre de lignes extraites depuis le CSV : ${rows.length}`)

    logInfo('🛠️ Début de l\'insertion dans Supabase...')

    const validRows = rows.filter(
      (row) =>
        row.teamname_1 !== 'Unknown Team' &&
        row.teamname_2 !== 'Unknown Team' &&
        row.teamid_1 &&
        row.teamid_2
    )

    logInfo(`📋 Total de matchs valides (équipes connues) : ${validRows.length}`)

    const existingMatches = await getExistingMatchIds()
    const existingGameIds = new Set(existingMatches.map((m) => m.id?.trim()))

    logInfo(`🧠 Nombre de gameid déjà présents en base : ${existingGameIds.size}`)

    const cleanedRows = validRows.map((row) => ({
      ...row,
      gameid: row.gameid?.trim()
    }))

    const newMatches = cleanedRows.filter(
      (row) => !existingGameIds.has(row.gameid)
    )

    const newGameIds = newMatches.map((m) => m.gameid)

    logInfo(`🆕 Nouveaux matchs à insérer : ${newMatches.length}`)
    logInfo(`🔎 Exemple de gameid en base : ${[...existingGameIds].slice(0, 5).join(', ')}`)
    logInfo(`🔎 Exemple de gameid dans le CSV : ${cleanedRows.slice(0, 5).map(r => r.gameid).join(', ')}`)
    logInfo(`📦 Nombre total de gameid uniques dans le CSV : ${new Set(cleanedRows.map(r => r.gameid)).size}`)
    logInfo(`🧾 Exemple de nouveaux gameid (max 20) : ${newGameIds.slice(0, 20).join(', ')}`)

    if (newMatches.length === 0) {
      logInfo('📭 Aucun nouveau match à insérer.')
    } else {
      await insertDataToSupabase(newMatches)
    }

    logInfo('✅ Import terminé avec succès.')
  } catch (err) {
    logError('❌ Erreur lors de l\'import :', err.message || err)
    process.exit(1)
  }
}

main()
