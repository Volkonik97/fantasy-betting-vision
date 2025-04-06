import { parse } from 'csv-parse/sync';
import axios from 'axios';
import { supabase } from './supabaseClient.js';

const normalizeGameId = (id) => id?.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');

const downloadCSV = async (fileId) => {
  const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
  const response = await axios.get(url);
  return response.data;
};

export const parseCSVFile = async (fileId) => {
  const csvRaw = await downloadCSV(fileId);
  const records = parse(csvRaw, { columns: true, skip_empty_lines: true });
  const ignoredMatches = [];
  const matchMap = new Map();

  for (const row of records) {
    const gameid = normalizeGameId(row.gameid);
    if (!gameid) continue;
    const blue = row.teamname;
    const red = row.teamname_1;

    if (
      [blue, red].some(name => !name || name.trim().toLowerCase().includes("unknown"))
    ) {
      ignoredMatches.push(gameid);
      continue;
    }

    if (!matchMap.has(gameid)) {
      matchMap.set(gameid, []);
    }
    matchMap.get(gameid).push(row);
  }

  const validMatches = Array.from(matchMap.entries()).map(([gameid, rows]) => {
    const matchRow = rows[0];

    const match = {
      gameid,
      matchesRow: {
        id: gameid,
        date: matchRow.date,
        patch: matchRow.patch,
        tournament: matchRow.league,
        team_blue_id: matchRow.teamname,
        team_red_id: matchRow.teamname_1,
        winner_team_id: matchRow.blueWins === '1' ? matchRow.teamname : matchRow.teamname_1,
        score_blue: parseInt(matchRow.blueKills) || null,
        score_red: parseInt(matchRow.redKills) || null,
        ckpm: parseFloat(matchRow.ckpm) || null,
        year: matchRow.year,
        split: matchRow.split,
        duration: parseInt(matchRow.gamelength) || null,
        game_completeness: matchRow.datacompleteness,
        playoffs: matchRow.playoffs === 'TRUE',
      },
      teamStatsRows: [
        {
          match_id: gameid,
          team_id: matchRow.teamname,
          is_blue_side: true,
          kills: parseInt(matchRow.blueKills) || 0,
          deaths: parseInt(matchRow.blueDeaths) || 0,
          dragons: parseInt(matchRow.blueDragons) || 0,
          barons: parseInt(matchRow.blueBarons) || 0,
          heralds: parseInt(matchRow.blueHeralds) || 0,
          towers: parseInt(matchRow.blueTowers) || 0,
          inhibitors: parseInt(matchRow.blueInhibitors) || 0,
          first_blood: matchRow.firstblood === 'blue',
          first_dragon: matchRow.firstdragon === 'blue',
          first_baron: matchRow.firstbaron === 'blue',
          first_herald: matchRow.firstherald === 'blue',
          first_tower: matchRow.firsttower === 'blue',
          first_mid_tower: matchRow.firstmidtower === 'blue',
          first_three_towers: matchRow.firstthreetowers === 'blue'
        },
        {
          match_id: gameid,
          team_id: matchRow.teamname_1,
          is_blue_side: false,
          kills: parseInt(matchRow.redKills) || 0,
          deaths: parseInt(matchRow.redDeaths) || 0,
          dragons: parseInt(matchRow.redDragons) || 0,
          barons: parseInt(matchRow.redBarons) || 0,
          heralds: parseInt(matchRow.redHeralds) || 0,
          towers: parseInt(matchRow.redTowers) || 0,
          inhibitors: parseInt(matchRow.redInhibitors) || 0,
          first_blood: matchRow.firstblood === 'red',
          first_dragon: matchRow.firstdragon === 'red',
          first_baron: matchRow.firstbaron === 'red',
          first_herald: matchRow.firstherald === 'red',
          first_tower: matchRow.firsttower === 'red',
          first_mid_tower: matchRow.firstmidtower === 'red',
          first_three_towers: matchRow.firstthreetowers === 'red'
        }
      ],
      playerStatsRows: rows.map((row) => ({
        match_id: gameid,
        player_name: row.playername,
        team_id: row.teamname,
        champion: row.champion,
        kills: parseInt(row.kills) || 0,
        deaths: parseInt(row.deaths) || 0,
        assists: parseInt(row.assists) || 0,
        cs: parseInt(row.cs) || 0,
        gold: parseInt(row.gold) || 0,
        position: row.position,
        team_position: row.teamposition
      }))
    };

    return match;
  });

  const { data: allMatches, error } = await supabase.from('matches').select('id');
  const allMatchIdsInSupabase = allMatches?.map(m => m.id) || [];

  const newMatches = validMatches.filter(m => !allMatchIdsInSupabase.includes(m.gameid));
  return { validMatches, ignoredMatches, allMatchIdsInSupabase, newMatches };
};
