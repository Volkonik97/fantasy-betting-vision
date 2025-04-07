// utils/supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import { logInfo, logError, logWarn } from './logger.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const getExistingMatchIds = async () => {
  logInfo('📡 Récupération des gameid existants depuis Supabase...')
  let existingIds = []
  let from = 0
  const pageSize = 1000

  while (true) {
    const { data, error } = await supabase
      .from('matches')
      .select('id')
      .range(from, from + pageSize - 1)

    if (error) {
      throw new Error(error.message)
    }

    if (!data || data.length === 0) break

    existingIds.push(...data.map(row => row.id))
    from += pageSize
  }

  logInfo(`🧠 Nombre de gameid déjà présents en base : ${existingIds.length}`)
  return new Set(existingIds)
}

export const getKnownTeamIds = async () => {
  const { data, error } = await supabase
    .from('teams')
    .select('id')

  if (error) {
    throw new Error(error.message)
  }

  return new Set(data.map(team => team.id))
}

export const insertDataToSupabase = async ({ matches, teamStats, playerStats }) => {
  try {
    logInfo(`📋 Total de matchs valides : ${matches.length}`)
    logInfo(`📈 Stats par équipe à insérer : ${teamStats.length}`)
    logInfo(`👤 Stats par joueur à insérer : ${playerStats.length}`)

    const existingIds = await getExistingMatchIds()
    const knownTeamIds = await getKnownTeamIds()

    const newMatches = matches.filter(match => {
      const valid =
        !existingIds.has(match.id) &&
        match.team_blue_id &&
        match.team_red_id &&
        knownTeamIds.has(match.team_blue_id) &&
        knownTeamIds.has(match.team_red_id)

      if (!valid) {
        logWarn(`⛔ Match ignoré (team inconnue) : ${match.id} - ${match.team_blue_id || '?'} vs ${match.team_red_id || '?'}`)
      }

      return valid
    })

    const matchIdsToInsert = new Set(newMatches.map(m => m.id))
    const newTeamStats = teamStats.filter(row => matchIdsToInsert.has(row.gameid))
    const newPlayerStats = playerStats.filter(row => matchIdsToInsert.has(row.gameid))

    logInfo(`🆕 Nouveaux matchs à insérer : ${newMatches.length}`)
    logInfo(`📈 Stats par équipe à insérer : ${newTeamStats.length}`)
    logInfo(`👤 Stats par joueur à insérer : ${newPlayerStats.length}`)

    if (newMatches.length > 0) {
      const { error: insertMatchError } = await supabase.from('matches').insert(newMatches)
      if (insertMatchError) throw new Error(`💥 Erreur lors de l'insertion des matchs : ${insertMatchError.message}`)
    }

    if (newTeamStats.length > 0) {
      const { error: insertTeamStatsError } = await supabase.from('team_match_stats').insert(newTeamStats)
      if (insertTeamStatsError) throw new Error(`💥 Erreur lors de l'insertion des stats équipe : ${insertTeamStatsError.message}`)
    }

    if (newPlayerStats.length > 0) {
      const { error: insertPlayerStatsError } = await supabase.from('player_match_stats').insert(newPlayerStats)
      if (insertPlayerStatsError) throw new Error(`💥 Erreur lors de l'insertion des stats joueur : ${insertPlayerStatsError.message}`)
    }

    logInfo('✅ Insertion terminée avec succès.')
  } catch (err) {
    logError('❌ Erreur lors de l\'insertion dans Supabase :', err.message || err)
    throw err
  }
}
