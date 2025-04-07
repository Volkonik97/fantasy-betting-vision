import { createClient } from '@supabase/supabase-js'
import { logInfo, logError } from './logger.js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export const insertDataToSupabase = async ({ matches, teamStats, playerStats }) => {
  try {
    logInfo(`📋 Total de matchs valides : ${matches.length}`)
    logInfo(`📈 Stats par équipe à insérer : ${teamStats.length}`)
    logInfo(`👤 Stats par joueur à insérer : ${playerStats.length}`)

    logInfo('📡 Récupération des gameid existants depuis Supabase...')
    const existingIds = await getExistingMatchIds()
    logInfo(`🧠 Nombre de gameid déjà présents en base : ${existingIds.length}`)

    const newMatches = matches.filter(match => !existingIds.includes(match.id))
    const newMatchIds = newMatches.map(m => m.id)
    const newTeamStats = teamStats.filter(stat => newMatchIds.includes(stat.match_id))
    const newPlayerStats = playerStats.filter(stat => newMatchIds.includes(stat.match_id))

    logInfo(`🆕 Nouveaux matchs à insérer : ${newMatches.length}`)
    logInfo(`📈 Stats par équipe à insérer : ${newTeamStats.length}`)
    logInfo(`👤 Stats par joueur à insérer : ${newPlayerStats.length}`)

    if (newMatches.length === 0) {
      logInfo('✅ Aucune nouvelle donnée à insérer.')
      return
    }

    const { error: matchError } = await supabase.from('matches').insert(newMatches)
    if (matchError) throw new Error(`💥 Erreur lors de l'insertion des matchs : ${matchError.message}`)

    const { error: teamError } = await supabase.from('team_match_stats').insert(newTeamStats)
    if (teamError) throw new Error(`💥 Erreur lors de l'insertion des stats équipes : ${teamError.message}`)

    const { error: playerError } = await supabase.from('player_match_stats').insert(newPlayerStats)
    if (playerError) throw new Error(`💥 Erreur lors de l'insertion des stats joueurs : ${playerError.message}`)

    logInfo('✅ Données insérées avec succès dans Supabase.')
  } catch (err) {
    logError("❌ Erreur lors de l'insertion dans Supabase :", err.message)
    throw err
  }
}

export const getExistingMatchIds = async () => {
  let allIds = []
  let from = 0
  const pageSize = 1000

  while (true) {
    const { data, error } = await supabase
      .from('matches')
      .select('id')
      .range(from, from + pageSize - 1)

    if (error) {
      logError('❌ Erreur lors de la récupération des matchs existants :', error.message)
      throw error
    }

    if (!data || data.length === 0) break
    allIds = allIds.concat(data.map(row => row.id))

    if (data.length < pageSize) break
    from += pageSize
  }

  return allIds
}  
