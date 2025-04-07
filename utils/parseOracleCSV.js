import Papa from 'papaparse'
import axios from 'axios'
import { logInfo, logError } from './logger.js'

export async function fetchCSVAndParse(sheetUrl) {
  try {
    logInfo(`🌍 URL utilisée : ${sheetUrl}`)
    logInfo(`⬇️ Téléchargement du CSV depuis : ${sheetUrl}`)
    const response = await axios.get(sheetUrl)

    const csvData = Papa.parse(response.data, {
      header: true,
      skipEmptyLines: true,
    }).data

    logInfo(`📊 Nombre de lignes extraites depuis le CSV : ${csvData.length}`)

    const matches = []
    const teamStats = []
    const playerStats = []

    for (const row of csvData) {
      // Filtrer les matchs valides avec deux équipes connues
      if (row.teamid_1 && row.teamid_2 && row.teamid_1 !== 'Unknown Team' && row.teamid_2 !== 'Unknown Team') {
        matches.push({
          id: row.gameid,
          date: row.date || null,
          tournament: row.tournament || null,
          team_blue_id: row.teamid_1,
          team_red_id: row.teamid_2,
          score_blue: row.result != null ? parseInt(row.result.split('-')[0]) : null,
          score_red: row.result != null ? parseInt(row.result.split('-')[1]) : null,
          duration: row.gamelength || null,
          first_blood: row.firstblood || null,
          first_dragon: row.firstdragon || null,
          first_baron: row.firstbaron || null,
          first_herald: row.firstherald || null,
          first_tower: row.firsttower || null,
          first_mid_tower: row.firstmidtower || null,
          first_three_towers: row.firstthreetowers || null,
          blue_win_odds: row.blue_odds ? parseFloat(row.blue_odds) : null,
          red_win_odds: row.red_odds ? parseFloat(row.red_odds) : null,
          predicted_winner: row.predictedwinner || null,
          winner_team_id: row.winner_team_id || null,
          game_number: row.gamenumber || null,
          patch: row.patch || null,
          mvp: row.mvp || null,
          playoffs: row.playoffs === 'TRUE' || row.playoffs === true,
          status: row.status || null,
          game_completeness: row.game_completeness || null,
          url: row.url || null,
          year: row.year || null,
          split: row.split || null,
        })
      }

      // Stats par équipe (team_match_stats)
      if (row.teamid) {
        teamStats.push({
          gameid: row.gameid,
          teamid: row.teamid,
          dragons: toInt(row.dragons),
          barons: toInt(row.barons),
          heralds: toInt(row.heralds),
          towers: toInt(row.towers),
          inhibitors: toInt(row.inhibitors),
          turret_plates: toInt(row.turretplates),
          void_grubs: toInt(row.voidgrubs),
          elemental_drakes: toInt(row.elementaldrakes),
          elders: toInt(row.elders),
          infernals: toInt(row.infernals),
          mountains: toInt(row.mountains),
          clouds: toInt(row.clouds),
          oceans: toInt(row.oceans),
          chemtechs: toInt(row.chemtechs),
          hextechs: toInt(row.hextechs),
          drakes_unknown: toInt(row.drakes_unknown),
          opp_dragons: toInt(row.opp_dragons),
          opp_barons: toInt(row.opp_barons),
          opp_heralds: toInt(row.opp_heralds),
          opp_towers: toInt(row.opp_towers),
          opp_inhibitors: toInt(row.opp_inhibitors),
          opp_turret_plates: toInt(row.opp_turretplates),
          opp_void_grubs: toInt(row.opp_voidgrubs),
          opp_elemental_drakes: toInt(row.opp_elementaldrakes),
          opp_elders: toInt(row.opp_elders),
          team_kills: toInt(row.kills),
          team_deaths: toInt(row.deaths),
          team_kpm: toFloat(row.kpm),
          ckpm: toFloat(row.ckpm),
        })
      }

      // Stats par joueur (player_match_stats)
      if (row.playername && row.gameid) {
        playerStats.push({
          gameid: row.gameid,
          playername: row.playername,
          teamid: row.teamid,
          champion: row.champion || null,
          kills: toInt(row.kills),
          deaths: toInt(row.deaths),
          assists: toInt(row.assists),
          gold: toInt(row.gold),
          cs: toInt(row.cs),
          position: row.position || null,
          dpm: toFloat(row.dpm),
          earned_gpm: toFloat(row.earned_gpm),
          kp: toFloat(row.kp),
          golddiffat10: toInt(row.golddiffat10),
          xpdiffat10: toInt(row.xpdiffat10),
          csdiffat10: toInt(row.csdiffat10),
        })
      }
    }

    logInfo(`📋 Total de matchs valides (équipes connues) : ${matches.length}`)
    logInfo(`📈 Total de stats par équipe : ${teamStats.length}`)
    logInfo(`👤 Total de stats par joueur : ${playerStats.length}`)

    return { matches, teamStats, playerStats }
  } catch (err) {
    logError('❌ Erreur lors du téléchargement ou parsing du CSV :', err.message || err)
    throw err
  }
}

function toInt(value) {
  const parsed = parseInt(value)
  return isNaN(parsed) ? null : parsed
}

function toFloat(value) {
  const parsed = parseFloat(value)
  return isNaN(parsed) ? null : parsed
}
