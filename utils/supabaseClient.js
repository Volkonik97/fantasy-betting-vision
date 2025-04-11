import { createClient } from '@supabase/supabase-js'
import { logInfo, logError } from './logger.js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

export async function getExistingMatchIds() {
  let allIds = []
  let from = 0
  const pageSize = 1000
  let keepGoing = true

  while (keepGoing) {
    const { data, error } = await supabase
      .from('matches')
      .select('gameid', { count: 'exact' })
      .range(from, from + pageSize - 1)

    if (error) throw error
    if (!data.length) break

    allIds.push(...data.map(d => d.gameid))
    from += pageSize
    keepGoing = data.length === pageSize
  }

  return allIds
}

export async function getKnownTeamIds() {
  const { data, error } = await supabase.from('teams').select('teamid')
  if (error) throw error
  return data.map(d => d.teamid)
}

export async function insertDataToSupabase({ matches, teamStats, playerStats }) {
  if (matches.length) {
    const { error } = await supabase.from('matches').insert(matches)
    if (error) logError(`Erreur insertion matches : ${error.message}`)
    else logInfo(`✅ ${matches.length} matchs insérés.`)
  }

  if (teamStats.length) {
    const { error } = await supabase.from('team_match_stats').insert(teamStats)
    if (error) logError(`Erreur insertion team stats : ${error.message}`)
    else logInfo(`✅ ${teamStats.length} stats équipe insérées.`)
  }

  if (playerStats.length) {
    const { error } = await supabase.from('player_match_stats').insert(playerStats)
    if (error) logError(`Erreur insertion player stats : ${error.message}`)
    else logInfo(`✅ ${playerStats.length} stats joueur insérées.`)
  }
}

export async function insertRawOracleRows(rows) {
  if (!rows || rows.length === 0) return

  const { error } = await supabase.from('raw_oracle_matches').insert(rows)
  if (error) {
    logError(`Erreur lors de l'import des données brutes : ${error.message}`)
    throw error
  }
  logInfo(`📦 ${rows.length} lignes brutes insérées dans raw_oracle_matches.`)
}