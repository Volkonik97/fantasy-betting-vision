import { createClient } from '@supabase/supabase-js'
import { logInfo, logError } from './logger.js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('❌ SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définis.')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export const getExistingMatchIds = async () => {
  logInfo('📡 Lecture des gameid existants (pagination manuelle)...')
  let allIds = []
  let from = 0
  const batchSize = 1000

  while (true) {
    const to = from + batchSize - 1
    const { data, error, count } = await supabase
      .from('matches')
      .select('id', { count: 'exact' })
      .range(from, to)

    if (error) {
      logError('❌ Erreur lors de la récupération des matchs existants :', error.message)
      throw error
    }

    logInfo(`➡️ Récupéré ${data.length} IDs (de ${from} à ${to})`)
    allIds = allIds.concat(data.map(row => row.id))

    if (data.length < batchSize) break
    from += batchSize
  }

  logInfo(`📊 Total d'IDs récupérés : ${allIds.length}`)
  return allIds
}

export const insertMatches = async (matches) => {
  if (matches.length === 0) {
    logInfo('📭 Aucun match à insérer.')
    return
  }

  logInfo(`📥 Insertion de ${matches.length} matchs dans Supabase...`)
  const { error } = await supabase.from('matches').insert(matches)

  if (error) {
    logError('💥 Erreur lors de l\'insertion des matchs :', error.message)
    throw error
  }

  logInfo('✅ Matchs insérés avec succès.')
}

export const insertTeamStats = async (teamStats) => {
  if (teamStats.length === 0) {
    logInfo('📭 Aucune statistique d\'équipe à insérer.')
    return
  }

  logInfo(`📥 Insertion de ${teamStats.length} stats d'équipe...`)
  const { error } = await supabase.from('team_match_stats').insert(teamStats)

  if (error) {
    logError('💥 Erreur lors de l\'insertion des team_match_stats :', error.message)
    throw error
  }

  logInfo('✅ Statistiques d\'équipes insérées avec succès.')
}

export const insertPlayerStats = async (playerStats) => {
  if (playerStats.length === 0) {
    logInfo('📭 Aucune statistique de joueur à insérer.')
    return
  }

  logInfo(`📥 Insertion de ${playerStats.length} stats de joueurs...`)
  const { error } = await supabase.from('player_match_stats').insert(playerStats)

  if (error) {
    logError('💥 Erreur lors de l\'insertion des player_match_stats :', error.message)
    throw error
  }

  logInfo('✅ Statistiques de joueurs insérées avec succès.')
}
