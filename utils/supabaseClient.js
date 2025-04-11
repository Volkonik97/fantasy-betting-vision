// utils/supabaseClient.js
import { createClient } from '@supabase/supabase-js'
import { logInfo, logError } from './logger.js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);




export const getKnownGameIds = async () => {
  const { data, error } = await supabase
    .from('raw_oracle_matches')
    .select('gameid')

  if (error) {
    logError('[getKnownGameIds] ❌ Erreur :', error)
    return new Set()
  }

  return new Set(data.map((row) => row.gameid))
}

export const insertRawMatches = async (matches) => {
  if (!matches.length) {
    logInfo('[insertRawMatches] Aucun match à insérer.')
    return
  }

  const { error } = await supabase
    .from('raw_oracle_matches')
    .insert(matches)

  if (error) {
    logError('[insertRawMatches] ❌ Erreur Supabase :', error)
    throw error
  }

  logInfo(`[insertRawMatches] ✅ ${matches.length} matchs insérés.`)
}
