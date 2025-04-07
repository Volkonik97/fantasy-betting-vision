import { createClient } from '@supabase/supabase-js'
import { logInfo, logError } from './logger.js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export const insertDataToSupabase = async ({ matches, teamStats, playerStats }) => {
  try {
    logInfo(`📋 Total de matchs valides : ${matches.length}`)
    logInfo(`📈 Stats par équipe à insérer : ${teamStats.length}`)
    logInfo(`👤 Stats par joueur à insérer : ${playerStats.length}`)

    logInfo('📡 Récupération des gameid existants depuis Supabase...')
    const { data: existingMatches, error: fetchError } = await supabase
      .from('matches')
      .select('id')
      .limit(10000)

    if (fetchError) throw new Error(fetchError.message)
    const existingIds = new Set(existingMatches.map(m => m.id))
    logInfo(`🧠 Nombre de gameid déjà présents en base : ${existingIds.size}`)

    const newMatches = matches.filter(match => !existingIds.has(match.id))
    const newTeamStats = teamStats.filter(stat => !existingIds.has(stat.gameid))
    const newPlayerStats = playerStats.filter(stat => !existingIds.has(stat.gameid))

    logInfo(`🆕 Nouveaux matchs à insérer : ${newMatches.length}`)
    logInfo(`📈 Stats par équipe à insérer : ${newTeamStats.length}`)
    logInfo(`👤 Stats par joueur à insérer : ${newPlayerStats.length}`)

    const { error: insertMatchError } = await supabase.from('matches').insert(newMatches)
    if (insertMatchError) throw new Error(`💥 Erreur lors de l'insertion des matchs : ${insertMatchError.message}`)

    if (newTeamStats.length > 0) {
      const { error: teamStatsError } = await supabase.from('team_match_stats').insert(newTeamStats)
      if (teamStatsError) throw new Error(`💥 Erreur insertion stats équipes : ${teamStatsError.message}`)
    }

    if (newPlayerStats.length > 0) {
      const { error: playerStatsError } = await supabase.from('player_match_stats').insert(newPlayerStats)
      if (playerStatsError) throw new Error(`💥 Erreur insertion stats joueurs : ${playerStatsError.message}`)
    }

  } catch (err) {
    logError('❌ Erreur lors de l'insertion dans Supabase :', err.message)
    throw err
  }
}
