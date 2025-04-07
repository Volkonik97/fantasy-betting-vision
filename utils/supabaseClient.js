import { createClient } from '@supabase/supabase-js'
import { logInfo, logError } from './logger.js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const PAGE_SIZE = 1000

export const getExistingMatchIds = async () => {
  try {
    logInfo('📡 Récupération des gameid existants depuis Supabase...')
    let allMatches = []
    let from = 0

    while (true) {
      const { data, error, count } = await supabase
        .from('matches')
        .select('id', { count: 'exact' })
        .range(from, from + PAGE_SIZE - 1)

      if (error) throw error
      if (!data || data.length === 0) break

      allMatches.push(...data.map(d => d.id))
      logInfo(`  ➕ ${data.length} gameids récupérés (total = ${allMatches.length})`)

      from += PAGE_SIZE
    }

    logInfo(`✅ Récupération terminée : ${allMatches.length} gameids existants`)
    return allMatches
  } catch (err) {
    logError('❌ Erreur lors de la récupération des matchs existants :', err.message || err)
    throw err
  }
}

export const insertDataToSupabase = async (parsedRows) => {
  logInfo('🛠️ Début de l\'insertion dans Supabase...')

  const validRows = parsedRows.filter(row =>
    row.teamname_1 !== 'Unknown Team' &&
    row.teamname_2 !== 'Unknown Team' &&
    row.teamid_1 &&
    row.teamid_2 &&
    row.teamid_1 !== 'Unknown Team' &&
    row.teamid_2 !== 'Unknown Team'
  )

  logInfo(`📋 Total de matchs valides (équipes connues) : ${validRows.length}`)

  const existingIds = await getExistingMatchIds()
  const newMatches = validRows.filter(row => !existingIds.includes(row.gameid))

  logInfo(`🧠 Nombre de gameid déjà présents en base : ${existingIds.length}`)
  logInfo(`🆕 Nouveaux matchs à insérer : ${newMatches.length}`)

  if (newMatches.length === 0) {
    logInfo('ℹ️ Aucun nouveau match à insérer.')
    return
  }

  const matchesToInsert = newMatches.map(row => ({
    id: row.gameid,
    tournament: row.league,
    date: row.date,
    team_blue_id: row.teamid_1,
    team_red_id: row.teamid_2,
    status: 'completed',
    score_blue: parseInt(row.result === '1' ? 1 : 0),
    score_red: parseInt(row.result === '2' ? 1 : 0),
    winner_team_id: row.result === '1' ? row.teamid_1 : row.result === '2' ? row.teamid_2 : null,
    first_blood: row.firstblood,
    first_dragon: row.firstdragon,
    first_baron: row.firstbaron,
    patch: row.patch,
    year: row.year,
    split: row.split,
    game_number: row.game,
    playoffs: row.playoffs === 'TRUE',
    game_completeness: row.gameid && row.firstblood ? 'complete' : 'partial',
    url: row.url
  }))

  try {
    const { error } = await supabase.from('matches').insert(matchesToInsert)

    if (error) {
      logError('💥 Erreur lors de l\'insertion des matchs :', error.message || error)
      throw error
    }

    logInfo(`✅ ${matchesToInsert.length} matchs insérés avec succès.`)
  } catch (err) {
    logError('❌ Erreur lors de l\'import :', err.message || err)
    throw err
  }
}
