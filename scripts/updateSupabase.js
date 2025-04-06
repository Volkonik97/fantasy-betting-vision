import { createClient } from '@supabase/supabase-js'
import axios from 'axios'
import Papa from 'papaparse'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
const FILE_ID = process.env.GOOGLE_FILE_ID

console.log("🔒 SUPABASE_URL:", SUPABASE_URL ? "✅" : "❌")
console.log("🔒 SUPABASE_KEY:", SUPABASE_KEY ? "✅" : "❌")
console.log("🔒 GOOGLE_FILE_ID:", FILE_ID ? "✅" : "❌")

if (!SUPABASE_URL || !SUPABASE_KEY || !FILE_ID) {
  throw new Error("❌ Erreur : un ou plusieurs secrets manquent.")
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const normalizeGameId = (rawId) =>
  rawId?.toString().trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')

const fetchCsv = async () => {
  const url = `https://drive.google.com/uc?export=download&id=${FILE_ID}`
  const response = await axios.get(url)
  return response.data
}

const parseCsv = async () => {
  const csv = await fetchCsv()
  return new Promise((resolve, reject) => {
    Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: reject,
    })
  })
}

const getAllMatchIdsFromSupabase = async () => {
  const pageSize = 1000
  let all = []
  let page = 0
  let done = false

  while (!done) {
    const { data, error } = await supabase
      .from('matches')
      .select('id')
      .range(page * pageSize, (page + 1) * pageSize - 1)

    if (error) throw new Error("❌ Erreur récupération matchs Supabase.")
    all = [...all, ...data]
    if (data.length < pageSize) done = true
    else page++
  }

  return all.map((m) => normalizeGameId(m.id))
}

const importAll = async () => {
  const rows = await parseCsv()
  console.log(`📥 Fichier CSV téléchargé`)
  console.log(`🔍 Total lignes CSV : ${rows.length}`)

  const grouped = {}
  const unknownMatches = new Set()

  for (const row of rows) {
    const id = normalizeGameId(row.gameid)
    if (!id || !row.teamname || row.teamname.toLowerCase().includes("unknown")) {
      unknownMatches.add(id)
      continue
    }
    if (!grouped[id]) grouped[id] = []
    grouped[id].push(row)
  }

  const uniqueMatches = Object.entries(grouped)
    .filter(([id]) => !unknownMatches.has(id))
    .map(([id, rows]) => ({ id, rows }))

  console.log(`🧩 Matchs uniques valides trouvés : ${uniqueMatches.length}`)

  const existingIds = new Set(await getAllMatchIdsFromSupabase())
  console.log(`🧠 Matchs trouvés dans Supabase (réels) : ${existingIds.size}`)

  const newMatches = uniqueMatches.filter((m) => !existingIds.has(m.id))
  console.log(`🆕 Nouveaux matchs à importer : ${newMatches.length}`)

  if (newMatches.length > 0) {
    console.log("🧾 Liste des gameid considérés comme nouveaux :")
    newMatches.forEach((m) => console.log(`➡️ ${m.id}`))
  }

  for (const match of newMatches) {
    const rowBlue = match.rows.find((r) => r.side === 'Blue')
    const rowRed = match.rows.find((r) => r.side === 'Red')
    if (!rowBlue || !rowRed) continue

    const base = rowBlue

    try {
      await supabase.from('matches').insert({
        id: match.id,
        date: base.date,
        tournament: base.league,
        patch: base.patch,
        duration: base.gamelength,
        team_blue_id: rowBlue.teamname,
        team_red_id: rowRed.teamname,
        score_blue: rowBlue.kills,
        score_red: rowRed.kills,
        winner_team_id: base.result === 'Win' ? rowBlue.teamname : rowRed.teamname,
        first_blood: base.firstblood === '1',
        first_dragon: base.firstdragon === '1',
        first_baron: base.firstbaron === '1',
        first_herald: base.firstherald === '1',
        first_tower: base.firsttower === '1',
        first_mid_tower: base.firstmidtower === '1',
        first_three_towers: base.firstthreetowers === '1',
        dragons: rowBlue.dragons,
        opp_dragons: rowRed.dragons,
        barons: rowBlue.barons,
        opp_barons: rowRed.barons,
        heralds: rowBlue.heralds,
        opp_heralds: rowRed.heralds,
        towers: rowBlue.towers,
        opp_towers: rowRed.towers,
        inhibitors: rowBlue.inhibitors,
        opp_inhibitors: rowRed.inhibitors,
        team_kills: rowBlue.kills,
        team_deaths: rowBlue.deaths,
        team_kpm: rowBlue.teamkpm,
        ckpm: base.ckpm,
        year: base.year,
        split: base.split,
        playoffs: base.playoffs === 'TRUE',
        game_completeness: base.datacompleteness,
      })

      // insert team stats
      for (const row of match.rows) {
        await supabase.from('team_match_stats').insert({
          match_id: match.id,
          team_id: row.teamname,
          is_blue_side: row.side === 'Blue',
          kills: row.kills,
          deaths: row.deaths,
          dragons: row.dragons,
          barons: row.barons,
          heralds: row.heralds,
          towers: row.towers,
          inhibitors: row.inhibitors,
          first_blood: row.firstblood === '1',
          first_dragon: row.firstdragon === '1',
          first_baron: row.firstbaron === '1',
          first_herald: row.firstherald === '1',
          first_tower: row.firsttower === '1',
          first_mid_tower: row.firstmidtower === '1',
          first_three_towers: row.firstthreetowers === '1',
        })
      }

      // insert player match stats & players
      for (const row of match.rows) {
        for (let i = 1; i <= 5; i++) {
          const player = row[`player${i}`]
          const champion = row[`champion${i}`]
          if (!player) continue

          await supabase.from('players').upsert({
            id: player,
            name: player,
          })

          await supabase.from('player_match_stats').insert({
            match_id: match.id,
            player_id: player,
            team_id: row.teamname,
            is_blue_side: row.side === 'Blue',
            champion,
          })
        }
      }

      console.log(`✅ Importé : ${match.id}`)
    } catch (err) {
      console.error(`❌ Erreur pour ${match.id} :`, err.message)
    }
  }

  if (newMatches.length > 0) {
    await supabase.from('data_updates').insert([
      { source: 'oracles_elixir', updated_at: new Date().toISOString() }
    ])
    console.log("📌 data_updates mise à jour.")
  } else {
    console.log("🎉 Aucun nouveau match à importer aujourd'hui.")
  }
}

importAll().catch((err) => {
  console.error("❌ Erreur générale :", err.message)
  process.exit(1)
})
