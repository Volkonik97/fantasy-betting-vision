import Papa from 'papaparse'
import axios from 'axios'
import { logInfo, logWarn } from './logger.js'

export const parseOracleCSV = async (url, knownTeamIds) => {
  try {
    const response = await axios.get(url, {
      responseType: 'blob',
      maxRedirects: 5,
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
    const seenMatchIds = new Set()

    // Group by gameid
    const grouped = rows.reduce((acc, row) => {
      if (!row.gameid) return acc
      if (!acc[row.gameid]) acc[row.gameid] = []
      acc[row.gameid].push(row)
      return acc
    }, {})

    for (const [gameid, matchRows] of Object.entries(grouped)) {
      const teams = [...new Set(matchRows.map(r => r.teamid).filter(Boolean))]
      if (teams.length !== 2) {
        logWarn(`❌ Match ${gameid} ignoré : ${teams.length} équipes détectées.`)
        continue
      }

      const [team_1_id, team_2_id] = teams

      if (!knownTeamIds.includes(team_1_id) || !knownTeamIds.includes(team_2_id)) {
        if (gameid === 'LOLTMNT06_110171') {
          logWarn(`❌ Match ${gameid} ignoré : équipe inconnue.`)
        }
        continue
      }

      const match = {
        id: gameid,
        team_1_id,
        team_2_id,
        // autres champs si besoin...
      }

      if (!seenMatchIds.has(gameid)) {
        matches.push(match)
        seenMatchIds.add(gameid)
      }

      const groupedByTeam = matchRows.reduce((acc, row) => {
        if (!acc[row.teamid]) acc[row.teamid] = []
        acc[row.teamid].push(row)
        return acc
      }, {})

      for (const [teamId, teamRows] of Object.entries(groupedByTeam)) {
        const exampleRow = teamRows[0] // prendre la première ligne comme base
        teamStats.push({
          match_id: gameid,
          team_id: teamId,
          dragons: Number(exampleRow.dragons) || 0,
          barons: Number(exampleRow.barons) || 0,
          // autres stats d'équipe si besoin...
        })
      }

      for (const row of matchRows) {
        playerStats.push({
          gameid,
          player_id: row.playerid,
          kills: Number(row.kills) || 0,
          deaths: Number(row.deaths) || 0,
          assists: Number(row.assists) || 0,
          // autres stats de joueur...
        })
      }
    }

    const matchExists = matches.find(m => m.id === 'LOLTMNT06_110171')
    if (matchExists) {
      logInfo('✅ Le match LOLTMNT06_110171 sera transmis à Supabase.')
    } else {
      logWarn('⚠️ Le match LOLTMNT06_110171 a été filtré avant insertion.')
    }

    logInfo(`📋 Total de matchs valides (équipes connues) : ${matches.length}`)
    logInfo(`📈 Total de stats par équipe : ${teamStats.length}`)
    logInfo(`👤 Total de stats par joueur : ${playerStats.length}`)

    return { matches, teamStats, playerStats }
  } catch (err) {
    throw new Error(`Erreur lors du parsing du CSV : ${err.message}`)
  }
}
