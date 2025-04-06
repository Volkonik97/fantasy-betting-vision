import fs from 'fs';
import fetch from 'node-fetch';
import csv from 'csv-parser';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import os from 'os';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const fileId = process.env.GOOGLE_FILE_ID;

console.log(`🔒 SUPABASE_URL: ${supabaseUrl ? '✅' : '❌'}`);
console.log(`🔒 SUPABASE_KEY: ${supabaseKey ? '✅' : '❌'}`);
console.log(`🔒 GOOGLE_FILE_ID: ${fileId ? '✅' : '❌'}`);

if (!supabaseUrl || !supabaseKey || !fileId) {
  console.error('❌ Erreur : un ou plusieurs secrets manquent.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const csvUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
const tmpPath = path.join(os.tmpdir(), 'oracle_matches.csv');

async function downloadCSV() {
  const response = await fetch(csvUrl);
  const stream = fs.createWriteStream(tmpPath);
  return new Promise((resolve, reject) => {
    response.body.pipe(stream);
    response.body.on('error', reject);
    stream.on('finish', resolve);
  });
}

function parseCSV() {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(tmpPath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function getExistingGameIds() {
  const { data, error } = await supabase
    .from('matches')
    .select('id');
  if (error) throw error;
  return new Set(data.map((row) => row.id));
}

function isValidMatch(match) {
  return (
    match.gameid &&
    match.teamname &&
    match.side &&
    match.teamname !== 'Unknown Team'
  );
}

async function main() {
  console.log('📥 Téléchargement du CSV...');
  await downloadCSV();
  console.log('📄 Parsing CSV...');

  const rows = await parseCSV();
  console.log(`🔍 Total lignes CSV : ${rows.length}`);

  const matchesMap = new Map();
  const ignored = new Set();

  for (const row of rows) {
    const gameId = row.gameid;
    if (!gameId) continue;

    const key = gameId;
    if (!matchesMap.has(key)) {
      matchesMap.set(key, []);
    }
    matchesMap.get(key).push(row);
  }

  const existingGameIds = await getExistingGameIds();
  const newMatches = [];

  for (const [gameId, entries] of matchesMap) {
    const hasUnknown = entries.some((e) => e.teamname === 'Unknown Team');
    if (hasUnknown) {
      ignored.add(gameId);
      continue;
    }
    if (!existingGameIds.has(gameId)) {
      newMatches.push({ gameId, entries });
    }
  }

  console.log(`🛑 Lignes ignorées avec Unknown Team : ${ignored.size}`);
  console.log(`🧩 Matchs uniques valides trouvés : ${matchesMap.size - ignored.size}`);
  console.log(`🧠 Matchs trouvés dans Supabase (réels) : ${existingGameIds.size}`);
  console.log(`🆕 Nouveaux matchs à importer : ${newMatches.length}`);

  if (newMatches.length > 0) {
    console.log('🧾 Liste des gameid considérés comme nouveaux :');
    newMatches.forEach(({ gameId }) => console.log(`➡️ ${gameId}`));
  }

  // Exemple d'insertion simplifiée (à adapter)
  for (const { gameId } of newMatches) {
    const { error } = await supabase
      .from('matches')
      .insert({ id: gameId });
    if (error) {
      console.error(`❌ Erreur insertion match ${gameId}:`, error.message);
    } else {
      console.log(`✅ Importé : ${gameId}`);
    }
  }
}

main().catch((err) => {
  console.error('❌ Erreur globale :', err);
  process.exit(1);
});