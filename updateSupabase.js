import { fetchCSVAndParse } from './utils/parseOracleCSV.js'
import { insertDataToSupabase } from './utils/supabaseClient.js'
import { logInfo, logError } from './utils/logger.js'

const csvUrl = process.env.GOOGLE_FILE_URL

const main = async () => {
  try {
    logInfo('🟡 Démarrage de l\'import automatique depuis Google Sheet...')

    if (!csvUrl) throw new Error('❌ GOOGLE_FILE_URL est introuvable')

    const data = await fetchCSVAndParse(csvUrl)

    await insertDataToSupabase(data)

    logInfo('✅ Import terminé avec succès.')
  } catch (err) {
    logError('❌ Erreur lors de l\'import :', err.message || err)
    process.exit(1)
  }
}

main()
