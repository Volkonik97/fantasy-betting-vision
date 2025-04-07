import { createClient } from '@supabase/supabase-js'
import { logInfo, logError } from './logger.js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const PAGE_SIZE = 1000

export const getExistingMatchIds = async () => {
  logInfo('📡 Récupération des gameid existants depuis Supabase...')

  const allGameIds = []
  let from = 0
  let to = PAGE_SIZE - 1

  while (true) {
    const { data, error } = await supabase
      .from('matches')
      .select('id')
      .range(from, to)

    if (error) {
      logError('❌ Erreur lors de la récupération des matchs existants :', error.message)
      throw error
    }

    if (!data || data.length === 0) break

    allGameIds.push(...data.map(row => row.id))

    if (data.length < PAGE_SIZE) break // Fin de la pagination

    from += PAGE_SIZE
    to += PAGE_SIZE
  }

  logInfo(`🧠 Nombre de gameid déjà présents en base : ${allGameIds.length}`)
  return new Set(allGameIds)
}

export const insertDataToSupabase = async ({ matches, teamStats, playerStats }) => {
  logInfo('🛠️ Début de l\'insertion dans Supabase...')
  logInfo(`📋 Total de matchs valides : ${matches.length}`)
  logInfo(`📈 Stats par équipe à insérer : ${teamStats.length}`)
  logInfo(`👤 Stats par joueur à insérer : ${playerStats.length}`)

  const existingIds = await getExistingMatchIds()

  const newMatches = matches.filter(m => !existingIds.has(m.id))
  const newTeamStats = teamStats.filter(s => newMatches.some(m => m.id === s.match_id))
  const newPlayerStats = playerStats.filter(s => newMatches.some(m => m.id === s.match_id))

  logInfo(`🆕 Nouveaux matchs à insérer : ${newMatches.length}`)
  logInfo(`📈 Stats par équipe à insérer : ${newTeamStats.length}`)
  logInfo(`👤 Stats par joueur à insérer : ${newPlayerStats.length}`)

  try {
    if (newMatches.length > 0) {
      const { error } = await supabase.from('matches').insert(newMatches)
      if (error) throw new Error(`💥 Erreur lors de l'insertion des matchs : ${error.message}`)
    }

    if (newTeamStats.length > 0) {
      const { error } = await supabase.from('team_match_stats').insert(newTeamStats)
      if (error) throw new Error(`💥 Erreur lors de l'insertion des stats équipes : ${error.message}`)
    }

    if (newPlayerStats.length > 0) {
      const { error } = await supabase.from('player_match_stats').insert(newPlayerStats)
      if (error) throw new Error(`💥 Erreur lors de l'insertion des stats joueurs : ${error.message}`)
    }

  } catch (err) {
    logError('❌ Erreur lors de l\'insertion dans Supabase :', err.message || err)
    throw err
  }
}
