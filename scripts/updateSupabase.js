import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import Papa from 'papaparse';

// 🔍 DEBUG des variables d’environnement (fournies par GitHub Actions)
console.log("🔒 SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("🔒 SUPABASE_KEY:", process.env.SUPABASE_KEY?.slice(0, 10) + '...');
console.log("🔒 FILE_ID:", process.env.GOOGLE_FILE_ID);

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  throw new Error("❌ Variables d'environnement manquantes !");
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const FILE_ID = process.env.GOOGLE_FILE_ID;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const downloadCsv = async () => {
  const url = `https://drive.google.com/uc?export=download&id=${FILE_ID}`;
  const res = await axios.get(url);
  return res.data;
};

const parseCsv = async () => {
  const csv = await downloadCsv();
  return new Promise((resolve, reject) => {
    Papa.parse(csv, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: reject,
    });
  });
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
  const match_id = match.gameid;
  const team_blue = await getTeamId(match.blueTeamTag);
  const team_red = await getTeamId(match.redTeamTag);

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

  await supabase.from('matches').upsert(dataToInsert);
};

const insertTeamStats = async (match) => {
  const teams = [
    {
      tag: match.blueTeamTag,
      is_blue_side: true,
      prefix: 'blue',
    },
    {
      tag: match.redTeamTag,
      is_blue_side: false,
      prefix: 'red',
    },
  ];

  for (const t of teams) {
    const team_id = await getTeamId(t.tag);
    await supabase.from('team_match_stats').upsert({
      match_id: match.gameid,
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
  const matches = await parseCsv();

  for (const match of matches) {
    try {
      await insertMatch(match);
      await insertTeamStats(match);
      console.log(`✅ Import match ${match.gameid}`);
    } catch (err) {
      console.error(`❌ Erreur pour ${match.gameid}`, err.message);
    }
  }
};

importAll();