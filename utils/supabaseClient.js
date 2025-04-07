import { createClient } from '@supabase/supabase-js'
import { logError, logInfo } from './logger.js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function getExistingMatchIds() {
  try {
    logInfo('📡 Récupération des gameid existants depuis Supabase...')
    let allIds = []
    let from = 0
    const step = 1000
    while (true) {
      const { data, error, count } = await supabase
        .from('matches')
        .select('id', { count: 'exact' })
        .range(from, from + step - 1)

      if (error) {
        throw error
      }

      if (data.length === 0) break

      allIds.push(...data.map(match => match.id))
      from += step
    }

    logInfo(`🧠 Nombre de gameid déjà présents en base : ${allIds.length}`)
    return new Set(allIds)
  } catch (err) {
    logError('❌ Erreur lors de la récupération des matchs existants :', err.message)
    throw err
  }
}

export async function insertDataToSupabase({ matches, teamStats, playerStats }) {
  try {
    logInfo('🛠️ Début de l\'insertion dans Supabase...')
    logInfo(`📋 Total de matchs valides : ${matches.length}`)
    logInfo(`📈 Stats par équipe à insérer : ${teamStats.length}`)
    logInfo(`👤 Stats par joueur à insérer : ${playerStats.length}`)

    const existingMatchIds = await getExistingMatchIds()

    const newMatches = matches.filter(match => !existingMatchIds.has(match.id))
    const newTeamStats = teamStats.filter(stat => newMatches.find(m => m.id === stat.match_id))
    const newPlayerStats = playerStats.filter(stat => newMatches.find(m => m.id === stat.match_id))

    logInfo(`🆕 Nouveaux matchs à insérer : ${newMatches.length}`)
    logInfo(`📈 Stats par équipe à insérer : ${newTeamStats.length}`)
    logInfo(`👤 Stats par joueur à insérer : ${newPlayerStats.length}`)

    if (newMatches.length > 0) {
      const { error: matchError } = await supabase
        .from('matches')
        .insert(newMatches)

      if (matchError) {
        throw new Error(`💥 Erreur lors de l'insertion des matchs : ${matchError.message}`)
      }
    }

    if (newTeamStats.length > 0) {
      const { error: teamError } = await supabase
        .from('team_match_stats')
        .insert(newTeamStats)

      if (teamError) {
        throw new Error(`💥 Erreur lors de l'insertion des stats d'équipe : ${teamError.message}`)
      }
    }

    if (newPlayerStats.length > 0) {
      const { error: playerError } = await supabase
        .from('player_match_stats')
        .insert(newPlayerStats)

      if (playerError) {
        throw new Error(`💥 Erreur lors de l'insertion des stats joueur : ${playerError.message}`)
      }
    }

    logInfo('✅ Insertion terminée avec succès.')
  } catch (err) {
    logError('❌ Erreur lors de l\'insertion dans Supabase :', err.message || err)
    throw err
  }
}
