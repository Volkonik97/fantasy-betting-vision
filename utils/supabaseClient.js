import { createClient } from '@supabase/supabase-js'
import { logInfo, logError } from './logger.js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function insertDataToSupabase(data) {
  try {
    // Étape 1 : Filtrer les lignes valides
    const validMatches = data.filter(
      row =>
        row.teamname !== 'Unknown Team' &&
        row.teamname_1 !== 'Unknown Team' &&
        row.teamname_2 !== 'Unknown Team'
    )

    logInfo(`📋 Total de matchs valides (équipes connues) : ${validMatches.length}`)

    // Étape 2 : Obtenir tous les gameid déjà existants
    let existingGameIds = []
    let page = 0
    const pageSize = 1000
    while (true) {
      const { data: pageData, error } = await supabase
        .from('matches')
        .select('id')
        .range(page * pageSize, (page + 1) * pageSize - 1)

      if (error) {
        throw new Error(`Erreur lors de la récupération des gameid existants : ${error.message}`)
      }

      if (!pageData.length) break
      existingGameIds.push(...pageData.map(row => row.id))
      page++
    }

    logInfo(`🧠 Nombre de gameid déjà présents en base : ${existingGameIds.length}`)

    const newMatches = validMatches.filter(row => !existingGameIds.includes(row.gameid))

    logInfo(`🆕 Nouveaux matchs à insérer : ${newMatches.length}`)

    if (newMatches.length === 0) {
      logInfo('🔁 Aucun nouveau match à insérer.')
      return
    }

    // Préparer les données à insérer dans `matches` (exemple simple, à adapter selon ta structure)
    const matchesToInsert = newMatches.map(row => ({
      id: row.gameid,
      tournament: row.tournament,
      date: row.date,
      team_blue_id: row.teamid_1,
      team_red_id: row.teamid_2,
      blue_win_odds: row.blue_win_odds ? parseFloat(row.blue_win_odds) : null,
      red_win_odds: row.red_win_odds ? parseFloat(row.red_win_odds) : null,
      status: row.status || 'completed',
      winner_team_id: row.winner,
      score_blue: parseInt(row.score_blue) || 0,
      score_red: parseInt(row.score_red) || 0,
      duration: row.gamelength,
      mvp: row.mvp || null,
      first_blood: row.firstblood,
      first_dragon: row.firstdragon,
      first_baron: row.firstbaron,
      year: row.year,
      split: row.split,
      playoffs: row.playoffs === 'TRUE' || row.playoffs === true,
    }))

    // Insertion en base
    const { error: insertError, data: insertResult } = await supabase
      .from('matches')
      .insert(matchesToInsert)

    if (insertError) {
      logError('💥 Erreur lors de l\'insertion des matchs :', insertError.message)
    } else {
      logInfo(`✅ Insertion réussie de ${insertResult.length} nouveaux matchs.`)
    }
  } catch (err) {
    logError('❌ Erreur dans insertDataToSupabase :', err.message)
    throw err
  }
}
