import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import https from 'https';
import path from 'path';

// 🔒 Secrets via GitHub Actions
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

async function downloadCSV(fileId) {
  const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
  const dest = path.join('/tmp', 'oracles.csv');

  return new Promise((resolve, reject) => {
    console.log('📥 Téléchargement du fichier CSV...');
    const file = fs.createWriteStream(dest);
    https.get(url, response => {
      if (response.statusCode !== 200) {
        reject(new Error(`❌ Erreur téléchargement: ${response.statusCode}`));
        return;
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          console.log('📥 Fichier CSV téléchargé');
          resolve(dest);
        });
      });
    }).on('error', reject);
  });
}

function extractUniqueValidMatches(csvData) {
  const records = parse(csvData, {
    columns: true,
    skip_empty_lines: true
  });

  const groupedByGameId = new Map();
  let ignoredCount = 0;

  for (const row of records) {
    const gameid = row['gameid'];
    const teamname = row['teamname'];

    if (!gameid) continue;

    if (!groupedByGameId.has(gameid)) {
      groupedByGameId.set(gameid, []);
    }

    groupedByGameId.get(gameid).push(teamname);
  }

  const validMatches = [];

  for (const [gameid, teamnames] of groupedByGameId.entries()) {
    const hasUnknown = teamnames.some(name => name === 'Unknown Team');

    if (hasUnknown || teamnames.length < 2) {
      console.log(`🚫 Ignoré ${gameid} (Unknown Team détectée)`);
      ignoredCount++;
    } else {
      validMatches.push({ gameid });
    }
  }

  return {
    matches: validMatches,
    ignored: ignoredCount,
    total: records.length
  };
}

async function fetchExistingGameIds() {
  let all = [];
  let from = 0;
  const limit = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('matches')
      .select('id')
      .range(from, from + limit - 1);

    if (error) throw error;
    if (!data.length) break;

    all = all.concat(data.map(d => d.id));
    from += limit;
  }

  return new Set(all);
}

async function main() {
  try {
    const csvPath = await downloadCSV(GOOGLE_FILE_ID);
    const csvContent = fs.readFileSync(csvPath, 'utf-8');

    const { matches, ignored, total } = extractUniqueValidMatches(csvContent);
    console.log(`🔍 Total lignes CSV : ${total}`);
    console.log(`🛑 Lignes ignorées avec Unknown Team : ${ignored}`);
    console.log(`🧩 Matchs uniques valides trouvés : ${matches.length}`);

    const existingIds = await fetchExistingGameIds();
    console.log(`🧠 Matchs trouvés dans Supabase (réels) : ${existingIds.size}`);

    const newMatches = matches.filter(m => !existingIds.has(m.gameid));
    console.log(`🆕 Nouveaux matchs à importer : ${newMatches.length}`);

    for (const match of newMatches) {
      console.log(`✅ À importer : ${match.gameid}`);
      // Ajoute ici l'insertion réelle si besoin
    }

  } catch (err) {
    console.error(`❌ Erreur générale : ${err.message}`);
    process.exit(1);
  }
}

main();
