import { fetchCSVAndParse } from './utils/parseOracleCSV.js'
import { insertMatches, insertTeamStats, insertPlayerStats, getExistingMatchIds } from './utils/supabaseClient.js'
import { logInfo, logError } from './utils/logger.js'

const SHEET_URL = process.env.GOOGLE_FILE_URL

const main = async () => {
  try {
    logInfo('🟡 Démarrage de l\'import automatique depuis Google Sheet...')
    logInfo(`🌍 URL utilisée : ${SHEET_URL}`)

    const parsedData = await fetchCSVAndParse(SHEET_URL)
    const { matches, team_match_stats, player_match_stats } = parsedData

    logInfo(`📦 Matches parsés : ${matches.length}`)
    logInfo(`📦 Team Match Stats parsés : ${team_match_stats.length}`)
    logInfo(`📦 Player Match Stats parsés : ${player_match_stats.length}`)

    if (matches.length === 0) {
      logInfo('⚠️ Aucun match valide trouvé, arrêt du script.')
      return
    }

    logInfo('📡 Récupération des gameid existants depuis Supabase...')
    const existingIds = await getExistingMatchIds()
    logInfo(`📊 GameIDs déjà en base : ${existingIds.length}`)

    const newMatches = matches.filter(m => !existingIds.includes(m.id))
    logInfo(`🆕 Nouveaux matchs à insérer : ${newMatches.length}`)

    if (newMatches.length === 0) {
      logInfo('🛑 Aucun nouveau match à insérer.')
      return
    }

    // === Filtrer les stats uniquement pour les nouveaux matchs ===
    const newMatchIds = new Set(newMatches.map(m => m.id))
    const newTeamStats = team_match_stats.filter(stat => newMatchIds.has(stat.match_id))
    const newPlayerStats = player_match_stats.filter(stat => newMatchIds.has(stat.match_id))

    logInfo(`📈 Insertion de ${newMatches.length} matchs...`)
    await insertMatches(newMatches)

    logInfo(`📈 Insertion de ${newTeamStats.length} statistiques d'équipes...`)
    await insertTeamStats(newTeamStats)

    logInfo(`📈 Insertion de ${newPlayerStats.length} statistiques de joueurs...`)
    await insertPlayerStats(newPlayerStats)

    logInfo('✅ Import terminé avec succès.')
  } catch (err) {
    logError('❌ Erreur lors de l\'import :', err.message || err)
    process.exit(1)
  }
}

main()
