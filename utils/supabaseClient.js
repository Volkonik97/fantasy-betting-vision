import { createClient } from '@supabase/supabase-js'
import { logInfo, logError } from './logger.js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export const getExistingMatchIds = async () => {
  try {
    let allMatches = []
    let from = 0
    const pageSize = 1000

    while (true) {
      const { data, error } = await supabase
        .from('matches')
        .select('id')
        .range(from, from + pageSize - 1)

      if (error) throw error
      if (!data || data.length === 0) break

      allMatches = allMatches.concat(data.map(d => d.id))
      from += pageSize
    }

    return allMatches
  } catch (err) {
    logError('❌ Erreur lors de la récupération des matchs existants :', err.message || err)
    throw err
  }
}

export const insertDataToSupabase = async (matches) => {
  try {
    logInfo(`📨 Tentative d'insertion de ${matches.length} matchs...`)
    const { data, error } = await supabase
      .from('matches')
      .insert(matches)

    if (error) {
      logError('💥 Erreur lors de l\'insertion des matchs :', error.message)
      throw error
    }

    logInfo(`✅ Insertion réussie de ${data?.length ?? 0} lignes.`)
  } catch (err) {
    logError('💥 Erreur inattendue lors de l\'insertion :', err.message || err)
    throw err
  }
}
