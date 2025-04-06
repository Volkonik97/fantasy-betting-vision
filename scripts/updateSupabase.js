import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse';
import { createWriteStream, readFileSync } from 'fs';
import { pipeline } from 'stream/promises';
import { tmpdir } from 'os';
import { join } from 'path';

// ✅ Récupération des variables d’environnement
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const GOOGLE_FILE_ID = process.env.GOOGLE_FILE_ID;

console.log(`🔒 SUPABASE_URL: ${SUPABASE_URL ? '✅' : '❌'}`);
console.log(`🔒 SUPABASE_KEY: ${SUPABASE_KEY ? '✅' : '❌'}`);
console.log(`🔒 GOOGLE_FILE_ID: ${GOOGLE_FILE_ID ? '✅' : '❌'}`);

if (!SUPABASE_URL || !SUPABASE_KEY || !GOOGLE_FILE_ID) {
  console.error('❌ Erreur : un ou plusieurs secrets manquent.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function downloadCSVFile(fileId) {
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  const tmpFile = join(tmpdir(), 'matches.csv');

  console.log('📥 Téléchargement du fichier CSV...');

  const response = await fetch(downloadUrl, { redirect: 'follow' });
  if (!response.ok) {
    throw new Error(`❌ Erreur téléchargement: ${response.status}`);
  }

  const fileStream = createWriteStream(tmpFile);
  await pipeline(response.body, fileStream);

  console.log('📥 Fichier CSV téléchargé');
  return tmpFile;
}

async function parseCSV(path) {
  const csvContent = readFileSync(path);
  return new Promise((resolve, reject) => {
    const records = [];
    parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
    })
      .on('data', (row) => records.push(row))
      .on('end', () => resolve(records))
      .on('error', (err) => reject(err));
  });
}

function isUnknownTeam(row) {
  return (
    row.teamname === 'Unknown Team' ||
    row.teamname_1 === 'Unknown Team' ||
    row.teamname_2 === 'Unknown Team'
  );
}

function getUniqueMatches(rows) {
  const matches = new Map();
  for (const row of rows) {
    const id = row.gameid;
    if (!id || isUnknownTeam(row)) {
      console.log(`🚫 Ignoré ${id} (Unknown Team détectée)`);
      continue;
    }
    if (!matches.has(id)) {
      matches.set(id, row);
    }
  }
  return matches;
}

async function getAllExistingMatchIds() {
  let all = [];
  let from = 0;
  const size = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('matches')
      .select('id')
      .range(from, from + size - 1);

    if (error) {
      console.error('❌ Erreur Supabase :', error.message);
      break;
    }

    if (data.length === 0) break;

    all = all.concat(data.map((d) => d.id));
    from += size;
  }

  return new Set(all);
}

async function main() {
  try {
    const csvPath = await downloadCSVFile(GOOGLE_FILE_ID);
    const rows = await parseCSV(csvPath);

    console.log(`🔍 Total lignes CSV : ${rows.length}`);

    const matches = getUniqueMatches(rows);
    console.log(`🧩 Matchs uniques valides trouvés : ${matches.size}`);

    const existingIds = await getAllExistingMatchIds();
    console.log(`🧠 Matchs trouvés dans Supabase (réels) : ${existingIds.size}`);

    const newMatches = [...matches.entries()].filter(([id]) => !existingIds.has(id));
    console.log(`🆕 Nouveaux matchs à importer : ${newMatches.length}`);

    for (const [id, row] of newMatches) {
      console.log(`✅ À insérer : ${id}`);
      // ⚠️ Ici tu peux ajouter l’appel à Supabase pour insérer les données
    }
  } catch (err) {
    console.error('❌ Erreur générale :', err.message);
    process.exit(1);
  }
}

main();
