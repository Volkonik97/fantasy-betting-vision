import fs from 'fs';
import path from 'path';
import https from 'https';
import { createClient } from '@supabase/supabase-js';
import csv from 'csv-parser';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const FILE_ID = process.env.GOOGLE_FILE_ID;

console.log('🔒 SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
console.log('🔒 SUPABASE_KEY:', SUPABASE_KEY ? '✅' : '❌');
console.log('🔒 FILE_ID:', FILE_ID ? '✅' : '❌');

if (!SUPABASE_URL || !SUPABASE_KEY || !FILE_ID) {
  console.error('❌ Erreur : un ou plusieurs secrets manquent.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const csvPath = path.join('scripts', 'latest.csv');

async function downloadCSV() {
  return new Promise((resolve, reject) => {
    const url = `https://drive.google.com/uc?export=download&id=${FILE_ID}`;
    const file = fs.createWriteStream(csvPath);

    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Erreur de téléchargement CSV: ${res.statusCode}`));
      }

      res.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('📥 Fichier CSV téléchargé');
        resolve();
      });
    }).on('error', reject);
  });
}

function parseCSV(filePath) {
  return new Promise((resolve) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => rows.push(data))
      .on('end', () => resolve(rows));
  });
}

async function main() {
  await downloadCSV();

  const allRows = await parseCSV(csvPath);
  console.log(`🔍 Total lignes CSV : ${allRows.length}`);

  const validRows = [];
  const seenIds = new Set();
  let ignored = 0;

  for (const row of allRows) {
    const gameid = row['gameid'];
    const blueTeam = row['teamname'];
    const redTeam = row['opponent'];

    if (!gameid || !blueTeam || !redTeam) continue;

    if (
      blueTeam.toLowerCase().includes('unknown') ||
      redTeam.toLowerCase().includes('unknown')
    ) {
      ignored++;
      continue;
    }

    if (!seenIds.has(gameid)) {
      seenIds.add(gameid);
      validRows.push({ ...row, gameid });
    }
  }

  console.log(`🛑 Lignes ignorées avec Unknown Team : ${ignored}`);
  console.log(`🧩 Matchs uniques valides trouvés : ${validRows.length}`);

  const { data: existingMatches, error } = await supabase
    .from('matches')
    .select('id');

  if (error) {
    console.error('❌ Erreur récupération Supabase :', error.message);
    process.exit(1);
  }

  const existingIds = new Set(existingMatches.map((m) => m.id));
  const newMatches = validRows.filter((row) => !existingIds.has(row.gameid));
  console.log(`🆕 Nouveaux matchs à importer : ${newMatches.length}`);

  for (const row of newMatches) {
    const gameid = row['gameid'];
    const match = {
      id: gameid,
      tournament: row['league'],
      date: row['date'],
      team_blue_id: row['teamname'],
      team_red_id: row['opponent'],
      patch: row['patch'],
      duration: row['gamelength'],
      score_blue: parseInt(row['result']) === 1 ? 1 : 0,
      score_red: parseInt(row['result']) === 1 ? 0 : 1,
      winner_team_id: parseInt(row['result']) === 1 ? row['teamname'] : row['opponent'],
      first_blood: row['fb'],
      first_dragon: row['fd'],
      first_baron: row['fbaron'],
      first_herald: row['fherald'],
      first_tower: row['ft'],
      first_mid_tower: row['firstmidtower'],
      dragons: row['dragons'],
      opp_dragons: row['opp_dragons'],
      barons: row['barons'],
      opp_barons: row['opp_barons'],
      heralds: row['heralds'],
      opp_heralds: row['opp_heralds'],
      towers: row['towers'],
      opp_towers: row['opp_towers'],
      inhibitors: row['inhibitors'],
      opp_inhibitors: row['opp_inhibitors'],
      team_kills: row['teamkills'],
      team_deaths: row['opp_kills'],
      team_kpm: row['team_kpm'],
      ckpm: row['combined_kpm'],
      year: row['season'].split(' ')[0],
      split: row['season'].split(' ')[1],
      game_completeness: row['gameid'].includes('t1') ? 'partial' : 'complete',
      playoffs: row['playoffs'] === 'TRUE',
    };

    console.log(`📦 Données match ${gameid}:`, match);

    const { error: matchErr } = await supabase.from('matches').insert([match]);
    if (matchErr) {
      console.error(`❌ Erreur insertion match ${gameid}:`, matchErr.message);
      continue;
    }

    const blueStats = {
      match_id: gameid,
      team_id: row['teamname'],
      side: 'blue',
    };
    const redStats = {
      match_id: gameid,
      team_id: row['opponent'],
      side: 'red',
    };

    const { error: teamStatErr } = await supabase.from('team_match_stats').insert([
      blueStats,
      redStats,
    ]);
    if (teamStatErr) {
      console.error(
        `❌ Erreur insertion team stats (${gameid}, ${row['teamname']}):`,
        teamStatErr.message
      );
    }

    console.log(`✅ Importé : ${gameid}`);
  }
}

main().catch((err) => {
  console.error('❌ Erreur inattendue :', err);
  process.exit(1);
});