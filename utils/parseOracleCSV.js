import Papa from 'papaparse'
import axios from 'axios'
import { logInfo, logError } from './logger.js'

export async function fetchCSVAndParse(url) {
  try {
    logInfo(`⬇️ Téléchargement du CSV depuis : ${url}`)
    const response = await axios.get(url)
    const csvData = response.data

    const { data, errors, meta } = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true
    })

    if (errors.length) {
      logError('Erreur lors du parsing CSV :', errors)
      throw new Error('Erreur de parsing CSV')
    }

    if (!meta.fields.includes('gameid') || !meta.fields.includes('teamid_1') || !meta.fields.includes('teamid_2')) {
      throw new Error('Le fichier CSV doit contenir les colonnes : gameid, teamid_1, teamid_2')
    }

    logInfo(`📊 Nombre de lignes extraites depuis le CSV : ${data.length}`)

    const matchesMap = new Map()
    const teamStatsMap = new Map()
    const playerStats = []

    for (const row of data) {
      const {
        gameid,
        teamid,
        teamid_1,
        teamid_2,
        side,
        participantid,
        playerid,
        position,
        champion,
        kills,
        deaths,
        assists,
        dragons,
        barons,
        heralds,
        towers,
        inhibitors,
        firstbloodkill,
        firstbloodassist,
        firstbloodvictim,
        // ... ajoute d'autres colonnes utiles ici
      } = row

      if (!gameid || !teamid_1 || !teamid_2 || teamid_1 === 'Unknown Team' || teamid_2 === 'Unknown Team') {
        continue
      }

      // ===== MISE EN FORME DES MATCHS =====
      if (!matchesMap.has(gameid)) {
        matchesMap.set(gameid, {
          id: gameid,
          team_blue_id: teamid_1,
          team_red_id: teamid_2,
          status: 'completed'
        })
      }

      // ===== MISE EN FORME DES TEAM STATS =====
      if (teamid) {
        const key = `${gameid}_${teamid}`
        if (!teamStatsMap.has(key)) {
          teamStatsMap.set(key, {
            match_id: gameid,
            team_id: teamid,
            is_blue_side: side === 'Blue',
            dragons: parseInt(dragons) || 0,
            barons: parseInt(barons) || 0,
            heralds: parseInt(heralds) || 0,
            towers: parseInt(towers) || 0,
            inhibitors: parseInt(inhibitors) || 0,
            first_blood: firstbloodkill === 'TRUE' || firstbloodassist === 'TRUE',
            created_at: new Date().toISOString()
          })
        }
      }

      // ===== MISE EN FORME DES PLAYER STATS =====
      if (playerid && participantid) {
        playerStats.push({
          match_id: gameid,
          player_id: playerid,
          team_id: teamid,
          side,
          participant_id: participantid,
          position,
          champion,
          kills: parseInt(kills) || 0,
          deaths: parseInt(deaths) || 0,
          assists: parseInt(assists) || 0,
          first_blood_kill: firstbloodkill === 'TRUE',
          first_blood_assist: firstbloodassist === 'TRUE',
          first_blood_victim: firstbloodvictim === 'TRUE',
          created_at: new Date().toISOString()
        })
      }
    }

    return {
      matches: Array.from(matchesMap.values()),
      team_match_stats: Array.from(teamStatsMap.values()),
      player_match_stats: playerStats
    }
  } catch (err) {
    logError('❌ Erreur lors du téléchargement ou parsing du CSV :', err.message || err)
    throw err
  }
}
