import axios from 'axios'
import Papa from 'papaparse'
import { logInfo, logError } from './logger.js'

export const fetchCSVAndParse = async (csvUrl) => {
  try {
    logInfo(`🌍 URL utilisée : ${csvUrl}`)
    logInfo(`⬇️ Téléchargement du CSV depuis : ${csvUrl}`)

    const response = await axios.get(csvUrl, {
      responseType: 'blob',
      maxRedirects: 5
    })

    const csvText = response.data

    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true
    })

    const rows = parsed.data
    logInfo(`📊 Nombre de lignes extraites depuis le CSV : ${rows.length}`)

    if (!rows[0].gameid) {
      throw new Error('Le fichier CSV doit contenir la colonne : gameid')
    }

    const matchesMap = new Map()
    const teamStatsMap = new Map()
    const playerStats = []

    for (const row of rows) {
      const {
        gameid,
        teamid,
        participantid,
        side,
        position,
        playername,
        champion,
        kills,
        deaths,
        assists,
        dragons,
        barons,
        towers,
        heralds,
        ...rest
      } = row

      if (!gameid || !teamid) continue

      // --- MATCHES ---
      if (!matchesMap.has(gameid)) {
        matchesMap.set(gameid, {
          id: gameid,
          teamIds: new Set(),
        })
      }
      matchesMap.get(gameid).teamIds.add(teamid)

      // --- TEAM STATS ---
      const teamKey = `${gameid}-${teamid}`
      if (!teamStatsMap.has(teamKey)) {
        teamStatsMap.set(teamKey, {
          match_id: gameid,
          team_id: teamid,
          is_blue_side: side?.toLowerCase() === 'blue',
          kills: 0,
          deaths: 0,
          dragons: parseInt(dragons) || 0,
          barons: parseInt(barons) || 0,
          towers: parseInt(towers) || 0,
          heralds: parseInt(heralds) || 0
        })
      }

      const teamStats = teamStatsMap.get(teamKey)
      teamStats.kills += parseInt(kills) || 0
      teamStats.deaths += parseInt(deaths) || 0

      // --- PLAYER STATS ---
      playerStats.push({
        match_id: gameid,
        team_id: teamid,
        participant_id: participantid,
        side,
        position,
        player_id: playername,
        champion,
        kills: parseInt(kills) || 0,
        deaths: parseInt(deaths) || 0,
        assists: parseInt(assists) || 0
      })
    }

    const matches = []
    for (const [gameid, match] of matchesMap.entries()) {
      const teams = Array.from(match.teamIds)
      if (teams.length !== 2) continue

      matches.push({
        id: gameid,
        team_blue_id: teams[0],
        team_red_id: teams[1],
        date: null,
        status: 'done'
      })
    }

    const team_match_stats = Array.from(teamStatsMap.values())

    logInfo(`📋 Total de matchs valides (équipes connues) : ${matches.length}`)
    logInfo(`📈 Total de stats par équipe : ${team_match_stats.length}`)
    logInfo(`👤 Total de stats par joueur : ${playerStats.length}`)

    return {
      matches,
      team_match_stats,
      player_match_stats: playerStats
    }
  } catch (err) {
    logError('❌ Erreur lors du téléchargement ou parsing du CSV :', err.message)
    throw err
  }
}
