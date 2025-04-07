import Papa from 'papaparse'
import axios from 'axios'
import { logInfo, logError } from './logger.js'

export const fetchCSVAndParse = async (csvUrl) => {
  logInfo(`🌍 URL utilisée : ${csvUrl}`)

  try {
    logInfo(`⬇️ Téléchargement du CSV depuis : ${csvUrl}`)
    const response = await axios.get(csvUrl)

    const parsed = Papa.parse(response.data, {
      header: true,
      skipEmptyLines: true,
    })

    const rows = parsed.data
    logInfo(`📊 Nombre de lignes extraites depuis le CSV : ${rows.length}`)

    const matches = []
    const teamStats = []
    const playerStats = []

    for (const row of rows) {
      const gameid = row.gameid
      const teamid = row.teamid

      if (!gameid || !teamid) {
        logInfo(`⛔ Ligne ignorée (gameid ou teamid manquant): ${JSON.stringify({ gameid, teamid })}`)
        continue
      }

      // Matchs valides : si on a les deux équipes définies dans deux lignes avec le même gameid
      const side = row.side
      if (side !== 'Blue' && side !== 'Red') {
        logInfo(`⛔ Ligne ignorée (side invalide): ${JSON.stringify({ gameid, teamid, side })}`)
        continue
      }

      // On stocke temporairement dans une map les matchs pour recomposition
      if (!row._matchCache) row._matchCache = {}
      row._matchCache[`${gameid}_${side}`] = row
    }

    // Regroupe les matchs à partir des lignes par side
    const matchCache = {}
    for (const row of rows) {
      const gameid = row.gameid
      const side = row.side
      if (!gameid || !side || (side !== 'Blue' && side !== 'Red')) continue

      if (!matchCache[gameid]) matchCache[gameid] = {}
      matchCache[gameid][side.toLowerCase()] = row
    }

    let validMatchCount = 0

    for (const [gameid, sides] of Object.entries(matchCache)) {
      const blue = sides.blue
      const red = sides.red

      if (!blue || !red) {
        logInfo(`⛔ Match ignoré (manque une des deux sides): ${gameid}`)
        continue
      }

      if (blue.teamid === 'Unknown Team' || red.teamid === 'Unknown Team') {
        logInfo(`⛔ Match ignoré (Unknown Team): ${gameid}`)
        continue
      }

      const match = {
        id: gameid,
        team_blue_id: blue.teamid,
        team_red_id: red.teamid,
        score_blue: parseInt(blue.result) || 0,
        score_red: parseInt(red.result) || 0,
        duration: blue.gamelength,
        date: blue.date,
        tournament: blue.tournament,
        patch: blue.patch,
        winner_team_id: blue.result === '1' ? blue.teamid : red.teamid,
      }

      matches.push(match)
      validMatchCount++
    }

    logInfo(`📋 Total de matchs valides (équipes connues) : ${validMatchCount}`)

    // Stats par équipe et par joueur
    for (const row of rows) {
      const gameid = row.gameid
      const teamid = row.teamid
      if (!gameid || !teamid || teamid === 'Unknown Team') continue

      teamStats.push({
        gameid,
        teamid,
        dragons: parseInt(row.dragons) || 0,
        barons: parseInt(row.barons) || 0,
        towers: parseInt(row.towers) || 0,
        kills: parseInt(row.teamkills) || 0,
        // ... ajoute d'autres champs ici si besoin
      })

      playerStats.push({
        gameid,
        playername: row.playername,
        teamid,
        champion: row.champion,
        kills: parseInt(row.kills) || 0,
        deaths: parseInt(row.deaths) || 0,
        assists: parseInt(row.assists) || 0,
        // ... ajoute d'autres champs ici si besoin
      })
    }

    logInfo(`📈 Total de stats par équipe : ${teamStats.length}`)
    logInfo(`👤 Total de stats par joueur : ${playerStats.length}`)

    return { matches, teamStats, playerStats }
  } catch (err) {
    throw new Error(`❌ Erreur lors du téléchargement ou parsing du CSV : ${err.message}`)
  }
}
