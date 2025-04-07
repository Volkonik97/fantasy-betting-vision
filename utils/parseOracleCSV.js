import Papa from 'papaparse'
import axios from 'axios'
import { logInfo, logWarn } from './logger.js'

const parseIntOrNull = (val) => {
  const parsed = parseInt(val)
  return isNaN(parsed) ? null : parsed
}

const parseFloatOrNull = (val) => {
  const parsed = parseFloat(val)
  return isNaN(parsed) ? null : parsed
}

const parseBoolean = (val) => val === '1'

export const parseOracleCSV = async (csvUrl, knownTeamIds) => {
  const response = await axios.get(csvUrl)
  const csvData = response.data

  const parsed = Papa.parse(csvData, {
    header: true,
    skipEmptyLines: true,
  })

  if (parsed.errors.length > 0) {
    throw new Error(`Erreurs lors du parsing du CSV : ${parsed.errors[0].message}`)
  }

  const rows = parsed.data
  const groupedByGame = {}

  for (const row of rows) {
    const gameId = row.gameid
    const teamId = row.teamid

    if (!gameId || !teamId) continue

    if (!groupedByGame[gameId]) groupedByGame[gameId] = []
    groupedByGame[gameId].push(row)
  }

  const matches = []
  const teamStats = []
  const playerStats = []

  for (const [gameId, gameRows] of Object.entries(groupedByGame)) {
    const teamsInGame = [...new Set(gameRows.map(r => r.teamid).filter(Boolean))]

    if (teamsInGame.length !== 2) {
      logWarn(`❌ Match ${gameId} ignoré : ${teamsInGame.length} équipes détectées.`)
      continue
    }

    const [team1, team2] = teamsInGame

    if (!knownTeamIds.includes(team1) || !knownTeamIds.includes(team2)) {
      logWarn(`❌ Match ${gameId} ignoré : équipe inconnue.`)
      continue
    }

    const gameMeta = gameRows[0]
    const match = {
      id: gameId,
      date: gameMeta.date,
      team_blue_id: gameRows.find(r => r.side === 'Blue')?.teamid || null,
      team_red_id: gameRows.find(r => r.side === 'Red')?.teamid || null,
      winner_team_id: gameRows.find(r => r.result === '1')?.teamid || null,
      game_number: gameMeta.game,
      split: gameMeta.split,
      year: gameMeta.year,
      patch: gameMeta.patch,
      playoffs: parseBoolean(gameMeta.playoffs),
      game_completeness: gameMeta.datacompleteness,
      tournament: gameMeta.league || null,
      first_blood: gameRows.find(r => r.firstblood === '1')?.teamid || null,
      first_dragon: gameRows.find(r => r.firstdragon === '1')?.teamid || null,
      first_baron: gameRows.find(r => r.firstbaron === '1')?.teamid || null,
      first_herald: gameRows.find(r => r.firstherald === '1')?.teamid || null,
      first_tower: gameRows.find(r => r.firsttower === '1')?.teamid || null,
      first_mid_tower: gameRows.find(r => r.firstmidtower === '1')?.teamid || null,
      first_three_towers: gameRows.find(r => r.firsttothreetowers === '1')?.teamid || null,
      duration: gameMeta.gamelength,
      bans: JSON.stringify([gameMeta.ban1, gameMeta.ban2, gameMeta.ban3, gameMeta.ban4, gameMeta.ban5].filter(Boolean)),
      picks: JSON.stringify([gameMeta.pick1, gameMeta.pick2, gameMeta.pick3, gameMeta.pick4, gameMeta.pick5].filter(Boolean)),
      team_kpm: parseFloatOrNull(gameMeta['team kpm']),
      ckpm: parseFloatOrNull(gameMeta.ckpm),
      dragons: parseIntOrNull(gameMeta.dragons),
      opp_dragons: parseIntOrNull(gameMeta.opp_dragons),
      elemental_drakes: parseIntOrNull(gameMeta.elementaldrakes),
      opp_elemental_drakes: parseIntOrNull(gameMeta.opp_elementaldrakes),
      infernals: parseIntOrNull(gameMeta.infernals),
      mountains: parseIntOrNull(gameMeta.mountains),
      clouds: parseIntOrNull(gameMeta.clouds),
      oceans: parseIntOrNull(gameMeta.oceans),
      chemtechs: parseIntOrNull(gameMeta.chemtechs),
      hextechs: parseIntOrNull(gameMeta.hextechs),
      drakes_unknown: parseIntOrNull(gameMeta['dragons (type unknown)']),
      elders: parseIntOrNull(gameMeta.elders),
      opp_elders: parseIntOrNull(gameMeta.opp_elders),
      void_grubs: parseIntOrNull(gameMeta.void_grubs),
      opp_void_grubs: parseIntOrNull(gameMeta.opp_void_grubs),
      towers: parseIntOrNull(gameMeta.towers),
      opp_towers: parseIntOrNull(gameMeta.opp_towers),
      turret_plates: parseIntOrNull(gameMeta.turretplates),
      opp_turret_plates: parseIntOrNull(gameMeta.opp_turretplates),
      inhibitors: parseIntOrNull(gameMeta.inhibitors),
      opp_inhibitors: parseIntOrNull(gameMeta.opp_inhibitors),
      barons: parseIntOrNull(gameMeta.barons),
      opp_barons: parseIntOrNull(gameMeta.opp_barons),
      team_kills: parseIntOrNull(gameMeta.teamkills),
    }

    matches.push(match)

    for (const row of gameRows) {
      teamStats.push({
        match_id: row.gameid,
        team_id: row.teamid,
        side: row.side,
        result: row.result === '1',
        heralds: parseIntOrNull(row.heralds),
        opp_heralds: parseIntOrNull(row.opp_heralds),
      })

      playerStats.push({
        match_id: row.gameid,
        player_id: row.playerid,
        player_name: row.playername,
        team_id: row.teamid,
        side: row.side,
        position: row.position,
        kills: parseIntOrNull(row.kills),
        deaths: parseIntOrNull(row.deaths),
        assists: parseIntOrNull(row.assists),
        damagetochampions: parseIntOrNull(row.damagetochampions),
        dpm: parseFloatOrNull(row.dpm),
        damageshare: parseFloatOrNull(row.damageshare),
        totalgold: parseIntOrNull(row.totalgold),
        earnedgold: parseIntOrNull(row.earnedgold),
        earnedgpm: parseFloatOrNull(row['earned gpm']),
        goldat10: parseIntOrNull(row.goldat10),
        xpat10: parseIntOrNull(row.xpat10),
        csat10: parseIntOrNull(row.csat10),
        goldat15: parseIntOrNull(row.goldat15),
        xpat15: parseIntOrNull(row.xpat15),
        csat15: parseIntOrNull(row.csat15),
        goldat20: parseIntOrNull(row.goldat20),
        xpat20: parseIntOrNull(row.xpat20),
        csat20: parseIntOrNull(row.csat20),
        goldat25: parseIntOrNull(row.goldat25),
        xpat25: parseIntOrNull(row.xpat25),
        csat25: parseIntOrNull(row.csat25),
      })
    }

    logInfo(`✅ Le match ${gameId} sera transmis à Supabase.`)
  }

  return { matches, teamStats, playerStats }
}
