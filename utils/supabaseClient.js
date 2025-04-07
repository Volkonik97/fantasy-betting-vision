import { createClient } from '@supabase/supabase-js'
import { logInfo, logError } from './logger.js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('❌ SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant dans les variables d\'environnement')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// 🔁 Pagination manuelle pour récupérer tous les IDs
export const getExistingMatchIds = async () => {
  const allRows = []
  let from = 0
  const pageSize = 1000
  let finished = false

  logInfo('📡 Récupération des gameid existants depuis Supabase...')

  while (!finished) {
    const { data, error, count } = await supabase
      .from('matches')
      .select('id', { count: 'exact' })
      .range(from, from + pageSize - 1)

    if (error) {
      logError('❌ Erreur lors de la récupération des matchs existants :', error.message)
      throw error
    }

    if (data.length === 0) {
      finished = true
    } else {
      allRows.push(...data)
      from += pageSize
    }
  }

  logInfo(`📥 Récupérés ${allRows.length} gameid existants.`)
  return allRows
}

export const insertDataToSupabase = async (newMatches) => {
  const { data, error } = await supabase.from('matches').insert(newMatches)

  if (error) {
    throw new Error('💥 Erreur lors de l\'insertion des matchs : ' + error.message)
  }

  logInfo(`✅ ${data.length} nouveaux matchs insérés dans la base.`)
}
