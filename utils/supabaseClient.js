import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('❌ SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

export const insertDataToSupabase = async (data) => {
  const matches = data.filter(row =>
    row.team_blue_id && row.team_red_id &&
    row.team_blue_id !== 'Unknown Team' &&
    row.team_red_id !== 'Unknown Team'
  )

  const { error } = await supabase.from('matches').upsert(matches, {
    onConflict: ['id']
  })

  if (error) throw error
}
