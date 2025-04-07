import { fetchCSVAndParse } from './utils/parseOracleCSV.js'
import { insertDataToSupabase } from './utils/supabaseClient.js'
import { logInfo, logError } from './utils/logger.js'

const SHEET_URL = process.env.GOOGLE_FILE_URL

const main = async () => {
  try {
    logInfo('🟡 Démarrage de l\'import automatique depuis Google Sheet...')
    logInfo(`🌍 URL utilisée : ${SHEET_URL}`)

    const parsedData = await fetchCSVAndParse(SHEET_URL)

    logInfo(`📋 Total de matchs valides (équipes connues) : ${parsedData.matches.length}`)
    logInfo(`📈 Total de stats par équipe : ${parsedData.teamStats.length}`)
    logInfo(`👤 Total de stats par joueur : ${parsedData.playerStats.length}`)

    await insertDataToSupabase(parsedData)

    logInfo('✅ Import terminé avec succès.')
  } catch (err) {
    logError('❌ Erreur lors de l\'import :', err.message || err)
    process.exit(1)
  }
}

main()
