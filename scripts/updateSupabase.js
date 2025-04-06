import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import Papa from 'papaparse';
import { parseCSV } from './utils/parseOracleCSV.js';
import { logError, logSuccess, logInfo } from './utils/logger.js';

console.log("🔒 SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("🔒 SUPABASE_KEY:", process.env.SUPABASE_KEY?.slice(0, 10) + '...');
console.log("🔒 GOOGLE_FILE_ID:", process.env.GOOGLE_FILE_ID);

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY || !process.env.GOOGLE_FILE_ID) {
  throw new Error("❌ Variables d'environnement manquantes !");
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const FILE_ID = process.env.GOOGLE_FILE_ID;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function normalizeGameId(rawId) {
  if (!rawId) return null;
  return rawId
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
    .replace(/[\s\-]+/g, '_')
    .replace(/__+/g, '_')
    .replace(/^_+|_+$/g, '');
}

const downloadCsv = async () => {
  const url = `https://drive.google.com/uc?export=download&id=${FILE_ID}`;
  const res = await axios.get(url);
  return res.data;
};

const getAllMatchIdsFromSupabase = async () => {
  const pageSize = 1000;
  let all = [];
  let page = 0;
  let done = false;

  while (!done) {
    const { data, error } = await supabase
      .from('matches')
      .select('id')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error("❌ Erreur pagination Supabase :", error.message);
      break;
    }

    if (data.length < pageSize) {
      done = true;
    }

    all = [...all, ...data];
    page++;
  }

  return all;
};

const getTeamId = async (teamTag) => {
  const { data, error } = await supabase
    .from('teams')
    .select('id')
    .eq('id', teamTag)
    .single();

  if (!data && !error) {
    await supabase.from('teams').insert({
      id: teamTag,
      name: teamTag,
      region: 'unknown',
    });
  }

  return teamTag;
};

const insertMatch = async (match) => {
  const match_id = normalizeGameId(match.gameid);
  const team_blue = await getTeamId(match.team_blue);
  const team_red = await getTeamId(match.team_red);

  const dataToInsert = {
    id: match_id,
    tournament: match.league,
    date: match.date,
    team_blue_id: team_blue,
    team_red_id: team_red,
    patch: match.patch,
    duration: match.gamelength,
    score_blue: Number(match.blueKills),
    score_red: Number(match.redKills),
    winner_team_id: match.blueWins === '1' ? team_blue : team_red,
    first_blood: match.firstblood,
    first_dragon: match.firstdragon,
    first_baron: match.firstbaron,
    first_herald: match.firstherald,
    first_tower: match.firsttower,
    first_mid_tower: match.firstmidtower,
    first_three_towers: match.firstthreetowers,
    dragons: Number(match.blueDragons),
    opp_dragons: Number(match.redDragons),
    barons: Number(match.blueBarons),
    opp_barons: Number(match.redBarons),
    heralds: Number(match.blueHeralds),
    opp_heralds: Number(match.redHeralds),
    towers: Number(match.blueTowers),
    opp_towers: Number(match.redTowers),
    inhibitors: Number(match.blueInhibitors),
    opp_inhibitors: Number(match.redInhibitors),
    team_kills: Number(match.blueKills),
    team_deaths: Number(match.blueDeaths),
    team_kpm: Number(match.teamkpm),
    ckpm: Number(match.ckpm),
    year: match.year,
    split: match.split,
    game_completeness: match.datacompleteness,
    playoffs: match.playoffs === 'TRUE',
  };

  await supabase.from('matches').insert(dataToInsert);
};

const insertTeamStats = async (match) => {
  const match_id = normalizeGameId(match.gameid);

  const teams = [
    {
      tag: match.team_blue,
      is_blue_side: true,
      prefix: 'blue',
    },
    {
      tag: match.team_red,
      is_blue_side: false,
      prefix: 'red',
    },
  ];

  for (const t of teams) {
    const team_id = await getTeamId(t.tag);
    await supabase.from('team_match_stats').insert({
      match_id,
      team_id,
      is_blue_side: t.is_blue_side,
      kills: Number(match[`${t.prefix}Kills`]),
      deaths: Number(match[`${t.prefix}Deaths`]),
      dragons: Number(match[`${t.prefix}Dragons`]),
      barons: Number(match[`${t.prefix}Barons`]),
      heralds: Number(match[`${t.prefix}Heralds`]),
      towers: Number(match[`${t.prefix}Towers`]),
      inhibitors: Number(match[`${t.prefix}Inhibitors`]),
      first_blood: match.firstblood === t.prefix,
      first_dragon: match.firstdragon === t.prefix,
      first_baron: match.firstbaron === t.prefix,
      first_herald: match.firstherald === t.prefix,
      first_tower: match.firsttower === t.prefix,
      first_mid_tower: match.firstmidtower === t.prefix,
      first_three_towers: match.firstthreetowers === t.prefix,
    });
  }
};

const importAll = async () => {
  const allRows = await parseCSV();
  console.log(`🔍 Total dans le CSV : ${allRows.length}`);

  // 🧠 Grouper les lignes par gameid
  const grouped = allRows.reduce((acc, row) => {
    const id = normalizeGameId(row.gameid);
    if (!id) return acc;
    if (!acc[id]) acc[id] = [];
    acc[id].push(row);
    return acc;
  }, {});

  const matches = Object.entries(grouped)
    .filter(([id, rows]) => {
      const teamNames = new Set(rows.map(r =>
        r.teamname?.trim().toLowerCase()
      ));
      const hasUnknown = [...teamNames].some(name =>
        name.includes("unknown")
      );
      if (hasUnknown) {
        console.log(`🚫 Ignoré ${id} (Unknown Team détectée)`);
      }
      return !hasUnknown;
    })
    .map(([id, rows]) => {
      const base = rows[0];
      const teams = [...new Set(rows.map(r => r.teamname))];
      return {
        ...base,
        gameid: id,
        team_blue: teams[0],
        team_red: teams[1],
      };
    });

  console.log(`🧩 Matchs uniques valides trouvés : ${matches.length}`);

  const existing = await getAllMatchIdsFromSupabase();
  const existingIds = new Set(existing.map((m) => normalizeGameId(m.id)));
  console.log(`🧠 Matchs trouvés dans Supabase (réels) : ${existingIds.size}`);

  const newMatches = matches.filter((m) => !existingIds.has(m.gameid));
  console.log(`🆕 Nouveaux matchs à importer : ${newMatches.length}`);

  if (newMatches.length > 0) {
    console.log("🧾 Liste des gameid considérés comme nouveaux :");
    newMatches.forEach((m) => console.log(`➡️ ${m.gameid}`));
  }

  for (const match of newMatches) {
    try {
      await insertMatch(match);
      await insertTeamStats(match);
      console.log(`✅ Importé : ${match.gameid}`);
    } catch (err) {
      console.error(`❌ Erreur pour ${match.gameid}:`, err.message);
    }
  }

  if (newMatches.length === 0) {
    console.log("🎉 Aucun nouveau match à importer aujourd'hui.");
  }
};

importAll();
