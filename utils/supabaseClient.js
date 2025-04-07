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
    logInfo('📡 Récupération des gameid existants depuis Supabase...')
    const existingGameIds = await getExistingMatchIds()
    logInfo(`🧠 Nombre de gameid déjà présents en base : ${existingGameIds.length}`)

    const allCsvGameIds = matches.map(m => m.id)
    logInfo(`📦 Tous les gameid du CSV (valide): ${allCsvGameIds.join(', ')}`)

    // 🔍 Récupération de tous les IDs d'équipes connues
    const { data: knownTeams, error: teamErr } = await supabase.from('teams').select('id')
    if (teamErr) throw new Error(`Erreur lors de la récupération des équipes : ${teamErr.message}`)
    const knownTeamIds = knownTeams.map(t => t.id)

    // 🎯 Filtrer les matchs avec équipes connues
    const matchesWithKnownTeams = matches.filter(m => {
      const isValid = knownTeamIds.includes(m.team_blue_id) && knownTeamIds.includes(m.team_red_id)
      if (!isValid) {
        logWarn(`⛔ Match ignoré (team inconnue) : ${m.id} - ${m.team_blue_id} vs ${m.team_red_id}`)
      }
      return isValid
    })

    const newMatches = matchesWithKnownTeams.filter(m => !existingGameIds.includes(m.id))
    const newGameIds = newMatches.map(m => m.id)

    logInfo(`🆕 Nouveaux gameid à insérer : ${newGameIds.join(', ')}`)
    logInfo(`🆕 Nouveaux matchs à insérer : ${newMatches.length}`)

    const newTeamStats = teamStats.filter(s => newGameIds.includes(s.match_id))
    const newPlayerStats = playerStats.filter(s => newGameIds.includes(s.gameid))

    logInfo(`📈 Stats par équipe à insérer : ${newTeamStats.length}`)
    logInfo(`👤 Stats par joueur à insérer : ${newPlayerStats.length}`)

    if (newMatches.length > 0) {
      const { error: matchError } = await supabase.from('matches').insert(newMatches)
      if (matchError) throw new Error(`💥 Erreur lors de l'insertion des matchs : ${matchError.message}`)
    }

    if (newTeamStats.length > 0) {
      const { error: teamError } = await supabase.from('team_match_stats').insert(newTeamStats)
      if (teamError) throw new Error(`💥 Erreur lors de l'insertion des stats équipe : ${teamError.message}`)
    }

    if (newPlayerStats.length > 0) {
      const { error: playerError } = await supabase.from('player_match_stats').insert(newPlayerStats)
      if (playerError) throw new Error(`💥 Erreur lors de l'insertion des stats joueur : ${playerError.message}`)
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
