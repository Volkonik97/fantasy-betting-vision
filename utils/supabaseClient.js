import { createClient } from '@supabase/supabase-js'
import { logInfo, logError, logWarn } from './logger.js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export const insertDataToSupabase = async ({ matches, teamStats, playerStats }) => {
  logInfo(`📋 Total de matchs valides : ${matches.length}`)
  logInfo(`📈 Stats par équipe à insérer : ${teamStats.length}`)
  logInfo(`👤 Stats par joueur à insérer : ${playerStats.length}`)

  try {
    // 🔍 Récupérer les ID d'équipes existantes
    const { data: teams, error: teamError } = await supabase.from('teams').select('id')
    if (teamError) throw new Error(`Erreur récupération équipes : ${teamError.message}`)
    const teamIds = teams.map(t => t.id)

    // 🧹 Filtrer les matchs avec équipes valides
    const filteredMatches = matches.filter(m =>
      m.team_blue_id && m.team_red_id &&
      teamIds.includes(m.team_blue_id) &&
      teamIds.includes(m.team_red_id)
    )

    logInfo(`📋 Total de matchs valides (équipes connues) : ${filteredMatches.length}`)

    // Récupérer les gameid existants pour éviter les doublons
    logInfo('📡 Récupération des gameid existants depuis Supabase...')
    const existingGameIds = await getExistingMatchIds()
    logInfo(`🧠 Nombre de gameid déjà présents en base : ${existingGameIds.length}`)

    const newMatches = filteredMatches.filter(m => !existingGameIds.includes(m.id))
    const newGameIds = newMatches.map(m => m.id)

    const newTeamStats = teamStats.filter(s => newGameIds.includes(s.match_id))
    const newPlayerStats = playerStats.filter(s => newGameIds.includes(s.gameid))

    logInfo(`🆕 Nouveaux matchs à insérer : ${newMatches.length}`)
    logInfo(`📈 Stats par équipe à insérer : ${newTeamStats.length}`)
    logInfo(`👤 Stats par joueur à insérer : ${newPlayerStats.length}`)

    if (newMatches.length > 0) {
      const { error: matchError } = await supabase.from('matches').insert(newMatches)
      if (matchError) throw new Error(`💥 Erreur lors de l'insertion des matchs : ${matchError.message}`)
    }

    if (newTeamStats.length > 0) {
      const { error: teamInsertError } = await supabase.from('team_match_stats').insert(newTeamStats)
      if (teamInsertError) throw new Error(`💥 Erreur lors de l'insertion des stats équipe : ${teamInsertError.message}`)
    }

    if (newPlayerStats.length > 0) {
      const { error: playerInsertError } = await supabase.from('player_match_stats').insert(newPlayerStats)
      if (playerInsertError) throw new Error(`💥 Erreur lors de l'insertion des stats joueur : ${playerInsertError.message}`)
    }

    logInfo('✅ Insertion terminée avec succès.')
  } catch (err) {
    logError(`❌ Erreur lors de l'insertion dans Supabase : ${err.message}`)
    throw err
  }
}

export const getExistingMatchIds = async () => {
  let allIds = []
  let from = 0
  const limit = 1000

  while (true) {
    const { data, error } = await supabase
      .from('matches')
      .select('id')
      .range(from, from + limit - 1)

    if (error) throw new Error(error.message)
    if (!data || data.length === 0) break

    allIds = allIds.concat(data.map(row => row.id))
    if (data.length < limit) break
    from += limit
  }

  return allIds
}
