import { createClient } from '@supabase/supabase-js'
import { logInfo, logError } from './logger.js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export const insertDataToSupabase = async ({ matches, teamStats, playerStats }) => {
  try {
    logInfo('🛠️ Début de l\'insertion dans Supabase...')

    logInfo(`📋 Total de matchs valides : ${matches.length}`)
    logInfo(`📈 Stats par équipe à insérer : ${teamStats.length}`)
    logInfo(`👤 Stats par joueur à insérer : ${playerStats.length}`)

    // Étape 1 : Récupérer les gameid déjà présents en base
    logInfo('📡 Récupération des gameid existants depuis Supabase...')

    let existingIds = []
    let from = 0
    const step = 1000

    while (true) {
      const { data, error } = await supabase
        .from('matches')
        .select('id', { count: 'exact' })
        .range(from, from + step - 1)

      if (error) {
        logError('❌ Erreur lors de la récupération des matchs existants :', error.message)
        throw error
      }

      if (data.length === 0) break

      existingIds.push(...data.map(row => row.id))
      from += step
    }

    logInfo(`🧠 Nombre de gameid déjà présents en base : ${existingIds.length}`)

    // Étape 2 : Ne garder que les nouveaux matchs
    const newMatches = matches.filter(m => !existingIds.includes(m.id))
    const newTeamStats = teamStats.filter(stat => !existingIds.includes(stat.match_id))
    const newPlayerStats = playerStats.filter(stat => !existingIds.includes(stat.match_id))

    logInfo(`🆕 Nouveaux matchs à insérer : ${newMatches.length}`)
    logInfo(`📈 Stats par équipe à insérer : ${newTeamStats.length}`)
    logInfo(`👤 Stats par joueur à insérer : ${newPlayerStats.length}`)

    // Étape 3 : Vérification de l'existence des équipes
    logInfo('📂 Vérification de l\'existence des équipes...')

    const { data: teamRows, error: teamError } = await supabase
      .from('teams')
      .select('id')

    if (teamError) {
      throw new Error(`Erreur lors de la récupération des équipes : ${teamError.message}`)
    }

    const existingTeamIds = teamRows.map(t => t.id)

    const finalMatches = newMatches.filter(
      m => existingTeamIds.includes(m.team_blue_id) && existingTeamIds.includes(m.team_red_id)
    )

    logInfo(`🧪 Matchs dont les équipes existent : ${finalMatches.length}`)

    const finalTeamStats = newTeamStats.filter(stat =>
      finalMatches.some(m => m.id === stat.match_id)
    )
    const finalPlayerStats = newPlayerStats.filter(stat =>
      finalMatches.some(m => m.id === stat.match_id)
    )

    logInfo(`📈 Stats par équipe finales : ${finalTeamStats.length}`)
    logInfo(`👤 Stats par joueur finales : ${finalPlayerStats.length}`)

    // Étape 4 : Insertion
    const { error: matchError } = await supabase
      .from('matches')
      .insert(finalMatches)

    if (matchError) {
      throw new Error(`💥 Erreur lors de l'insertion des matchs : ${matchError.message}`)
    }

    const { error: teamStatsError } = await supabase
      .from('team_match_stats')
      .insert(finalTeamStats)

    if (teamStatsError) {
      throw new Error(`💥 Erreur lors de l'insertion des stats d'équipe : ${teamStatsError.message}`)
    }

    const { error: playerStatsError } = await supabase
      .from('player_match_stats')
      .insert(finalPlayerStats)

    if (playerStatsError) {
      throw new Error(`💥 Erreur lors de l'insertion des stats joueurs : ${playerStatsError.message}`)
    }

    logInfo('✅ Données insérées avec succès !')

  } catch (error) {
    logError('❌ Erreur lors de l\'insertion dans Supabase :', error.message)
    throw error
  }
}
