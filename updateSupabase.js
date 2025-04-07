import { parseOracleCSV } from './utils/parseOracleCSV.js'
import { insertDataToSupabase, getExistingMatchIds } from './utils/supabaseClient.js'
import { logInfo, logError } from './utils/logger.js'

const csvUrl = process.env.GOOGLE_FILE_URL;

const main = async () => {
  try {
    logInfo('🟡 Démarrage de l\'import automatique depuis Google Sheet...')
    logInfo(`🌍 URL utilisée : ${csvUrl}`)

    const data = await parseOracleCSV(csvUrl)

    logInfo(`📋 Total de matchs valides (équipes connues) : ${data.matches.length}`)
    logInfo(`📈 Total de stats par équipe : ${data.teamStats.length}`)
    logInfo(`👤 Total de stats par joueur : ${data.playerStats.length}`)

    await insertDataToSupabase(data)
    logInfo('✅ Import terminé avec succès.')
  } catch (err) {
    logError('❌ Erreur lors de l\'import :', err.message || err)
    process.exit(1)
  }
}

main()
