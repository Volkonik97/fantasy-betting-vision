import { createClient } from '@supabase/supabase-js'
import { logInfo, logError, logWarn } from './logger.js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export const getExistingMatchIds = async () => {
  const allIds = []
  let from = 0
  const step = 1000
  while (true) {
    const { data, error } = await supabase
      .from('matches')
      .select('id', { count: 'exact' })
      .range(from, from + step - 1)

    if (error) throw new Error(error.message)
    if (!data || data.length === 0) break

    allIds.push(...data.map(match => match.id))
    from += step
  }
  return allIds
}

export const insertDataToSupabase = async ({ matches, teamStats, playerStats }) => {
  try {
    logInfo(`📋 Total de matchs valides : ${matches.length}`)
    logInfo(`📈 Stats par équipe à insérer : ${teamStats.length}`)
    logInfo(`👤 Stats par joueur à insérer : ${playerStats.length}`)

    // Vérifie existence des teams dans Supabase
    const uniqueTeamIds = [...new Set(matches.flatMap(m => [m.team_blue_id, m.team_red_id]))]
    const { data: existingTeams, error: teamErr } = await supabase
      .from('teams')
      .select('id')
      .in('id', uniqueTeamIds)

    if (teamErr) throw new Error(`Erreur de vérification des teams : ${teamErr.message}`)

    const existingTeamIds = new Set(existingTeams.map(t => t.id))

    const validMatches = matches.filter(m => {
      const valid =
        existingTeamIds.has(m.team_blue_id) &&
        existingTeamIds.has(m.team_red_id)
      if (!valid) {
        logWarn(`⛔ Match ignoré (team inconnue) : ${m.id} - ${m.team_blue_id} vs ${m.team_red_id}`)
      }
      return valid
    })

    const existingMatchIds = await getExistingMatchIds()
    const newMatches = validMatches.filter(m => !existingMatchIds.includes(m.id))
    const newTeamStats = teamStats.filter(t => newMatches.find(m => m.id === t.match_id))
    const newPlayerStats = playerStats.filter(p => newMatches.find(m => m.id === p.match_id))

    logInfo(`🧠 Nombre de gameid déjà présents en base : ${existingMatchIds.length}`)
    logInfo(`🆕 Nouveaux matchs à insérer : ${newMatches.length}`)
    logInfo(`📈 Stats par équipe à insérer : ${newTeamStats.length}`)
    logInfo(`👤 Stats par joueur à insérer : ${newPlayerStats.length}`)

    if (newMatches.length > 0) {
      const { error: matchErr } = await supabase.from('matches').insert(newMatches)
      if (matchErr) throw new Error(`💥 Erreur lors de l'insertion des matchs : ${matchErr.message}`)
    }

    if (newTeamStats.length > 0) {
      const { error: teamStatsErr } = await supabase.from('team_match_stats').insert(newTeamStats)
      if (teamStatsErr) throw new Error(`💥 Erreur insertion team stats : ${teamStatsErr.message}`)
    }

    if (newPlayerStats.length > 0) {
      const { error: playerStatsErr } = await supabase.from('player_match_stats').insert(newPlayerStats)
      if (playerStatsErr) throw new Error(`💥 Erreur insertion player stats : ${playerStatsErr.message}`)
    }

    logInfo('✅ Insertion terminée avec succès.')
  } catch (err) {
    logError('❌ Erreur lors de l\'insertion dans Supabase :', err.message || err)
    throw err
  }
}
