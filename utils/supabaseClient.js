import { createClient } from '@supabase/supabase-js'
import { logInfo, logError } from './logger.js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

export const insertDataToSupabase = async (data) => {
  const { matches, team_match_stats, player_match_stats } = data

  logInfo('🛠️ Début de l\'insertion dans Supabase...')
  logInfo(`📋 Total de matchs valides : ${matches.length}`)

  // Récupération des IDs déjà en base
  try {
    logInfo('📡 Récupération des gameid existants depuis Supabase...')
    const allGameIds = []
    let from = 0
    const limit = 1000
    let done = false

    while (!done) {
      const { data: batch, error } = await supabase
        .from('matches')
        .select('id')
        .range(from, from + limit - 1)

      if (error) {
        throw new Error(error.message)
      }

      if (batch.length === 0) {
        done = true
      } else {
        allGameIds.push(...batch.map(row => row.id))
        from += limit
        if (batch.length < limit) done = true
      }
    }

    logInfo(`🧠 Nombre de gameid déjà présents en base : ${allGameIds.length}`)

    const newMatches = matches.filter(m => !allGameIds.includes(m.id))
    logInfo(`🆕 Nouveaux matchs à insérer : ${newMatches.length}`)

    if (newMatches.length === 0) {
      logInfo('📭 Aucun nouveau match à insérer.')
      return
    }

    const newTeamStats = team_match_stats.filter(stat =>
      newMatches.some(m => m.id === stat.match_id)
    )

    const newPlayerStats = player_match_stats.filter(stat =>
      newMatches.some(m => m.id === stat.match_id)
    )

    logInfo(`📈 Stats par équipe à insérer : ${newTeamStats.length}`)
    logInfo(`👤 Stats par joueur à insérer : ${newPlayerStats.length}`)

    const { error: matchError } = await supabase
      .from('matches')
      .insert(newMatches)

    if (matchError) {
      throw new Error(`💥 Erreur lors de l'insertion des matchs : ${matchError.message}`)
    }

    const { error: teamStatError } = await supabase
      .from('team_match_stats')
      .insert(newTeamStats)

    if (teamStatError) {
      throw new Error(`💥 Erreur lors de l'insertion des stats équipes : ${teamStatError.message}`)
    }

    const { error: playerStatError } = await supabase
      .from('player_match_stats')
      .insert(newPlayerStats)

    if (playerStatError) {
      throw new Error(`💥 Erreur lors de l'insertion des stats joueurs : ${playerStatError.message}`)
    }

    logInfo('✅ Insertion terminée avec succès.')
  } catch (err) {
    logError('❌ Erreur lors de l\'insertion dans Supabase :', err.message)
    throw err
  }
}
