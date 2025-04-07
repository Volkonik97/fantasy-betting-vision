import { fetchCSVAndParse } from './utils/parseOracleCSV.js'
import { insertDataToSupabase, getExistingMatchIds } from './utils/supabaseClient.js'
import { logInfo, logError } from './utils/logger.js'

const SHEET_URL = process.env.GOOGLE_FILE_URL;

const main = async () => {
  try {
    logInfo('🟡 Démarrage de l\'import automatique depuis Google Sheet...')
    logInfo(`🌍 URL utilisée : ${SHEET_URL}`)

    const data = await fetchCSVAndParse(SHEET_URL)
    logInfo(`📊 Nombre de lignes extraites depuis le CSV : ${data.length}`)

    const validMatches = data.filter(row => row.teamname && row.teamname !== 'Unknown Team')
    logInfo(`📋 Total de matchs valides (équipes connues) : ${validMatches.length}`)

    logInfo('📡 Récupération des gameid existants depuis Supabase...')
    const existingIds = await getExistingMatchIds()
    logInfo(`🧠 Nombre de gameid déjà présents en base : ${existingIds.length}`)

    const newMatches = validMatches.filter(row => !existingIds.includes(row.gameid))
    logInfo(`🆕 Nouveaux matchs à insérer : ${newMatches.length}`)

    if (newMatches.length > 0) {
      logInfo('🚀 Lancement de l\'insertion dans la base Supabase...')
      await insertDataToSupabase(newMatches)
      logInfo('✅ Insertion terminée.')
    } else {
      logInfo('🟢 Aucun nouveau match à insérer.')
    }

    logInfo('🎉 Import terminé avec succès.')
  } catch (err) {
    logError('❌ Erreur lors de l\'import :', err.message || err)
    process.exit(1)
  }
}

main()
