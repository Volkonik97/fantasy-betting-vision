import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import https from 'https';
import path from 'path';
import csv from 'csv-parser';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const FILE_ID = process.env.FILE_ID;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const CSV_URL = `https://drive.google.com/uc?export=download&id=${FILE_ID}`;
const CSV_PATH = path.join('/tmp', 'oracles_elixir.csv');

function downloadCSV(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

async function parseCSV(filePath) {
  return new Promise((resolve) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results));
  });
}

function isValidMatch(row) {
  return (
    row.gameid &&
    row.teamname !== 'Unknown Team' &&
    row.opp_teamname !== 'Unknown Team'
  );
}

function buildMatch(row1, row2) {
  const isBlue1 = row1.side === 'Blue';
  return {
    ...row1,
    teamid_blue: isBlue1 ? row1.teamid : row2.teamid,
    teamname_blue: isBlue1 ? row1.teamname : row2.teamname,
    teamid_red: isBlue1 ? row2.teamid : row1.teamid,
    teamname_red: isBlue1 ? row2.teamname : row1.teamname,
  };
}

async function getOrCreateTeam(teamid, name) {
  const { data } = await supabase.from('teams').select('id').eq('id', teamid).maybeSingle();
  if (!data) {
    await supabase.from('teams').insert({ id: teamid, name, region: 'unknown' });
    console.log(`🏗️ Équipe ajoutée : ${teamid} (${name})`);
  }
  return teamid;
}

async function insertMatch(match) {
  const team_blue_id = await getOrCreateTeam(match.teamid_blue, match.teamname_blue);
  const team_red_id = await getOrCreateTeam(match.teamid_red, match.teamname_red);
  const winner_team_id = match.blueWins === '1' ? team_blue_id : team_red_id;

  const matchData = {
    id: match.gameid,
    tournament: match.league,
    date: match.date,
    team_blue_id,
    team_red_id,
    patch: match.patch,
    duration: match.gamelength,
    score_blue: parseInt(match.teamkills),
    score_red: parseInt(match.oppkills),
    winner_team_id,
    first_blood: match.firstblood,
    first_dragon: match.firstdragon,
    first_baron: match.firstbaron,
    first_herald: match.firstherald,
    first_tower: match.firsttower,
    first_mid_tower: match.firstmidtower,
    first_three_towers: match.first3towers,
    dragons: parseInt(match.dragons),
    opp_dragons: parseInt(match.opp_dragons),
    barons: parseInt(match.barons),
    opp_barons: parseInt(match.opp_barons),
    heralds: parseInt(match.heralds),
    opp_heralds: parseInt(match.opp_heralds),
    towers: parseInt(match.towers),
    opp_towers: parseInt(match.opp_towers),
    inhibitors: parseInt(match.inhibitors),
    opp_inhibitors: parseInt(match.opp_inhibitors),
    team_kills: parseInt(match.teamkills),
    team_deaths: parseInt(match.oppkills),
    team_kpm: parseFloat(match.kpm),
    ckpm: parseFloat(match.ckpm),
    year: match.year,
    split: match.split,
    game_completeness: 'complete',
    playoffs: match.playoffs === 'TRUE',
  };

  const { error } = await supabase.from('matches').insert(matchData);
  if (error) {
    console.error(`❌ Erreur lors de l'insertion du match ${match.gameid}: ${error.message}`);
  }
}

async function run() {
  await downloadCSV(CSV_URL, CSV_PATH);
  const rows = await parseCSV(CSV_PATH);

  console.log(`🔍 Total lignes CSV : ${rows.length}`);

  const valid = rows.filter(isValidMatch);
  const grouped = Object.values(valid.reduce((acc, row) => {
    if (!acc[row.gameid]) acc[row.gameid] = [];
    acc[row.gameid].push(row);
    return acc;
  }, {}));

  const matches = grouped.map((rows) => buildMatch(rows[0], rows[1]));
  console.log(`🧩 Matchs valides trouvés : ${matches.length}`);

  const { data: existing } = await supabase.from('matches').select('id');
  const existingIds = new Set(existing.map((m) => m.id));

  const newMatches = matches.filter((m) => !existingIds.has(m.gameid));
  console.log(`🆕 Nouveaux matchs à importer : ${newMatches.length}`);
  newMatches.forEach((m) => console.log(`➡️ ${m.gameid}`));

  for (const match of newMatches) {
    await insertMatch(match);
    console.log(`✅ Importé : ${match.gameid}`);
  }
}

run().catch((err) => {
  console.error('❌ Erreur fatale :', err);
  process.exit(1);
});
