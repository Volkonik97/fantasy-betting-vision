import Papa from 'papaparse'
import axios from 'axios'
import { logInfo, logWarn } from './logger.js'

export const parseOracleCSV = async (url, knownTeamIds) => {
  try {
    const response = await axios.get(url, {
      responseType: 'blob',
      maxRedirects: 5,
      validateStatus: status => status >= 200 && status < 400,
    })

    const csv = response.data
    const { data: rows, errors } = Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
    })

    if (errors.length > 0) {
      throw new Error(`Erreurs de parsing CSV : ${errors.map(e => e.message).join(', ')}`)
    }

    logInfo(`🔍 Recherche du match LOLTMNT06_110171 dans le CSV...`)
    const targetRow = rows.find(r => r.gameid === 'LOLTMNT06_110171')
    if (targetRow) {
      logInfo(`✅ Ligne trouvée dans le CSV : ${JSON.stringify(targetRow, null, 2)}`)
    } else {
      logWarn('❌ Match LOLTMNT06_110171 non trouvé dans les lignes CSV.')
    }

    const matches = []
    const teamStats = []
    const playerStats = []

    for (const row of rows) {
      const gameid = row.gameid
      const teamid_1 = row.teamid_1
      const teamid_2 = row.teamid_2

      // Validation des champs essentiels
      if (!gameid || !teamid_1 || !teamid_2) continue
      if (!knownTeamIds.includes(teamid_1) || !knownTeamIds.includes(teamid_2)) continue

      // Match info
      const match = {
        id: gameid,
        team_1_id: teamid_1,
        team_2_id: teamid_2,
        // Ajoute ici d'autres champs du match si nécessaire
      }

      if (gameid === 'LOLTMNT06_110171') {
        logInfo(`🔧 Construction du match LOLTMNT06_110171`)
        logInfo(`📎 teamid_1: ${teamid_1}, teamid_2: ${teamid_2}`)
        logInfo(`✅ teamid_1 connu ? ${knownTeamIds.includes(teamid_1)}`)
        logInfo(`✅ teamid_2 connu ? ${knownTeamIds.includes(teamid_2)}`)
        logInfo(`📦 Objet match construit : ${JSON.stringify(match, null, 2)}`)
      }

      matches.push(match)

      // Statistiques d'équipe (team 1 et 2)
      const teamStat = {
        match_id: gameid,
        team_id: teamid_1,
        dragons: Number(row.dragons_1) || 0,
        barons: Number(row.barons_1) || 0,
        // Ajoute d'autres stats d’équipe si nécessaires
      }

      const teamStat2 = {
        match_id: gameid,
        team_id: teamid_2,
        dragons: Number(row.dragons_2) || 0,
        barons: Number(row.barons_2) || 0,
        // Ajoute d'autres stats d’équipe si nécessaires
      }

      teamStats.push(teamStat, teamStat2)

      // Statistiques de joueur
      const player = {
        gameid,
        player_id: row.playerid,
        kills: Number(row.kills) || 0,
        deaths: Number(row.deaths) || 0,
        assists: Number(row.assists) || 0,
        // Ajoute d'autres stats joueur si nécessaires
      }

      playerStats.push(player)
    }

    // Vérification finale du match ciblé
    const matchExists = matches.find(m => m.id === 'LOLTMNT06_110171')
    if (matchExists) {
      logInfo('✅ Le match LOLTMNT06_110171 sera transmis à Supabase.')
    } else {
      logWarn('⚠️ Le match LOLTMNT06_110171 a été filtré avant insertion.')
    }

    return { matches, teamStats, playerStats }
  } catch (err) {
    throw new Error(`Erreur lors du parsing du CSV : ${err.message}`)
  }
}
