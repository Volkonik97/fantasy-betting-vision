import { fetchCSVAndParse } from './utils/parseOracleCSV.js'
import { insertDataToSupabase } from './utils/supabaseClient.js'
import { logInfo, logError } from './utils/logger.js'

const SHEET_URL = process.env.GOOGLE_FILE_URL

const main = async () => {
  try {
    logInfo('🟡 Démarrage de l\'import automatique depuis Google Sheet...')
    logInfo(`🌍 URL utilisée : ${SHEET_URL}`)

    if (!SHEET_URL) {
      throw new Error('❌ Variable d\'environnement GOOGLE_FILE_URL non définie')
    }

    const data = await fetchCSVAndParse(SHEET_URL)
    logInfo(`📊 Nombre de lignes extraites depuis le CSV : ${data.length}`)

    if (data.length === 0) {
      throw new Error('⚠️ Aucune donnée trouvée dans le fichier CSV.')
    }

    logInfo('🛠️ Début de l\'insertion dans Supabase...')
    await insertDataToSupabase(data)
    logInfo('✅ Import terminé avec succès.')
  } catch (err) {
    logError('❌ Erreur lors de l\'import :', err.message || err)
    process.exit(1)
  }
}

main()
