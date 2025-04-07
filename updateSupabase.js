import { parseOracleCSV } from './utils/parseOracleCSV.js'
import { insertDataToSupabase, getExistingMatchIds, getKnownTeamIds } from './utils/supabaseClient.js'
import { logInfo, logError, logWarn } from './utils/logger.js'

const GOOGLE_FILE_URL = process.env.GOOGLE_FILE_URL

const run = async () => {
  try {
    logInfo('🟡 Démarrage de l\'import automatique depuis Google Sheet...')
    logInfo(`🌍 URL utilisée : ${GOOGLE_FILE_URL}`)

    if (!GOOGLE_FILE_URL || !/^https?:\/\//.test(GOOGLE_FILE_URL)) {
      throw new Error(`URL invalide ou absente : "${GOOGLE_FILE_URL}"`)
    }

    const knownTeamIds = await getKnownTeamIds()
    logInfo(`📚 ${knownTeamIds.length} équipes connues récupérées depuis Supabase.`)

    const { matches, teamStats, playerStats } = await parseOracleCSV(GOOGLE_FILE_URL, knownTeamIds)

    logInfo(`📋 Total de matchs valides (équipes connues) : ${matches.length}`)
    logInfo(`📈 Total de stats par équipe : ${teamStats.length}`)
    logInfo(`👤 Total de stats par joueur : ${playerStats.length}`)

    await insertDataToSupabase({ matches, teamStats, playerStats })

    logInfo('✅ Import terminé avec succès.')
  } catch (err) {
    logError(`❌ Erreur lors de l'import : ${err.message}`)
  }
}

run()
