import axios from 'axios'
import Papa from 'papaparse'
import { logInfo, logError } from './logger.js'

export const fetchCSVAndParse = async (url) => {
  try {
    logInfo(`⬇️ Téléchargement du CSV depuis : ${url}`)

    const response = await axios.get(url)
    const csv = response.data

    const { data: rawData, errors } = Papa.parse(csv, {
      header: true,
      skipEmptyLines: true
    })

    if (errors.length > 0) {
      throw new Error(`Erreurs lors du parsing CSV : ${JSON.stringify(errors)}`)
    }

    logInfo(`📊 Nombre de lignes extraites depuis le CSV : ${rawData.length}`)

    const matches = []
    const teamStats = []
    const playerStats = []

    const gamesMap = new Map()

    for (const row of rawData) {
      const gameId = row.gameid
      const teamId = row.teamid
      const playerId = row.playerid || null

      if (!gameId || !teamId || teamId === 'Unknown Team') continue

      // Enregistrer le match dans gamesMap
      if (!gamesMap.has(gameId)) {
        gamesMap.set(gameId, {
          gameId,
          teams: new Set(),
          rows: [],
        })
      }

      const game = gamesMap.get(gameId)
      game.teams.add(teamId)
      game.rows.push(row)

      // Ajouter stats par joueur si playerId présent
      if (playerId) {
        playerStats.push({
          match_id: gameId,
          player_id: playerId,
          team_id: teamId,
          kills: parseInt(row.kills) || 0,
          deaths: parseInt(row.deaths) || 0,
          assists: parseInt(row.assists) || 0,
          gold: parseInt(row.gold) || 0,
          cs: parseInt(row.cs) || 0,
          champion: row.champion || null,
          role: row.role || null,
          position: row.position || null
        })
      }

      // Ajouter stats par équipe une seule fois par team/game combo
      if (!teamStats.find(s => s.match_id === gameId && s.team_id === teamId)) {
        teamStats.push({
          match_id: gameId,
          team_id: teamId,
          dragons: parseInt(row.dragons) || 0,
          barons: parseInt(row.barons) || 0,
          heralds: parseInt(row.heralds) || 0,
          towers: parseInt(row.towers) || 0,
          inhibitors: parseInt(row.inhibitors) || 0,
          first_blood: row.firstblood === '1',
          first_tower: row.firsttower === '1',
          first_dragon: row.firstdragon === '1',
          first_baron: row.firstbaron === '1',
        })
      }
    }

    // Reconstruire les matchs à partir des paires de team par gameId
    for (const [gameId, game] of gamesMap.entries()) {
      const teamList = Array.from(game.teams)
      if (teamList.length !== 2) continue // Skip si on n'a pas exactement 2 équipes

      matches.push({
        id: gameId,
        team_blue_id: teamList[0],
        team_red_id: teamList[1],
        date: null, // à remplir si dispo
        patch: null, // à remplir si dispo
        duration: null, // à remplir si dispo
        winner: null // à remplir si dispo
      })
    }

    return { matches, teamStats, playerStats }

  } catch (error) {
    logError('❌ Erreur lors du téléchargement ou parsing du CSV :', error.message)
    throw error
  }
}
