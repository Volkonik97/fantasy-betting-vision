import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const FILE_ID = process.env.FILE_ID;

console.log(`🔒 SUPABASE_URL: ${SUPABASE_URL ? '***' : 'undefined'}`);
console.log(`🔒 SUPABASE_KEY: ${SUPABASE_KEY ? '***' : 'undefined'}`);
console.log(`🔒 FILE_ID: ${FILE_ID ? '***' : 'undefined'}`);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Téléchargement CSV depuis Google Drive
async function downloadCSV(fileId, destPath) {
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
  const drive = google.drive({ version: 'v3', auth: await auth.getClient() });

  const res = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
  return new Promise((resolve, reject) => {
    const dest = fs.createWriteStream(destPath);
    res.data.pipe(dest);
    dest.on('finish', resolve);
    dest.on('error', reject);
  });
}

// Parse CSV
async function parseCSV(filePath) {
  return new Promise((resolve) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results));
  });
}

// Crée l'équipe si absente
const getTeamId = async (teamId, teamName) => {
  const { data, error } = await supabase
    .from('teams')
    .select('id')
    .eq('id', teamId)
    .single();

  if (!data && !error) {
    await supabase.from('teams').insert({
      id: teamId,
      name: teamName,
      region: 'unknown',
    });
    console.log(`🏗️ Team créée automatiquement : ${teamName} (${teamId})`);
  }

  return teamId;
};

// Insère un match dans Supabase
const insertMatch = async (match) => {
  const team_blue_id = await getTeamId(match.teamid_blue, match.teamname_blue);
  const team_red_id = await getTeamId(match.teamid_red, match.teamname_red);
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

  console.log(`📦 Données match ${match.gameid}:`, matchData);

  const { error } = await supabase.from('matches').insert(matchData);
  if (error) {
    console.error(`❌ Erreur insertion match ${match.gameid}:`, error.message);
  }
};

// Script principal
async function run() {
  const tmpPath = path.join('/tmp', 'match_data.csv');
  await downloadCSV(FILE_ID, tmpPath);
  const data = await parseCSV(tmpPath);

  console.log(`🔍 Total dans le CSV : ${data.length}`);

  const filtered = data.filter(
    (row) =>
      row.gameid &&
      row.teamname !== 'Unknown Team' &&
      row.opp_teamname !== 'Unknown Team'
  );

  const grouped = Object.values(
    filtered.reduce((acc, row) => {
      const id = row.gameid;
      if (!acc[id]) acc[id] = [];
      acc[id].push(row);
      return acc;
    }, {})
  );

  const matches = grouped.map((rows) => {
    const base = rows[0];
    const team1 = rows[0];
    const team2 = rows[1];

    return {
      ...base,
      teamid_blue: team1.side === 'Blue' ? team1.teamid : team2.teamid,
      teamname_blue: team1.side === 'Blue' ? team1.teamname : team2.teamname,
      teamid_red: team1.side === 'Red' ? team1.teamid : team2.teamid,
      teamname_red: team1.side === 'Red' ? team1.teamname : team2.teamname,
    };
  });

  console.log(`🧩 Matchs uniques valides trouvés : ${matches.length}`);

  const { data: existingMatches } = await supabase.from('matches').select('id');
  const existingIds = new Set(existingMatches.map((m) => m.id));

  const newMatches = matches.filter((match) => !existingIds.has(match.gameid));

  console.log(`🧠 Matchs trouvés dans Supabase (réels) : ${existingIds.size}`);
  console.log(`🆕 Nouveaux matchs à importer : ${newMatches.length}`);

  if (newMatches.length > 0) {
    console.log('🧾 Liste des gameid considérés comme nouveaux :');
    newMatches.forEach((m) => console.log(`➡️ ${m.gameid}`));
  }

  for (const match of newMatches) {
    await insertMatch(match);
    console.log(`✅ Importé : ${match.gameid}`);
  }
}

run().catch((e) => {
  console.error('❌ Erreur générale :', e);
  process.exit(1);
});