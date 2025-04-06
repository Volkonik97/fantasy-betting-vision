import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const FILE_ID = process.env.GOOGLE_FILE_ID;

console.log(`🔒 SUPABASE_URL: ${SUPABASE_URL ? '✅' : '❌'}`);
console.log(`🔒 SUPABASE_KEY: ${SUPABASE_KEY ? '✅' : '❌'}`);
console.log(`🔒 GOOGLE_FILE_ID: ${FILE_ID ? '✅' : '❌'}`);

if (!SUPABASE_URL || !SUPABASE_KEY || !FILE_ID) {
  console.error('❌ Erreur : un ou plusieurs secrets manquent.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function downloadCSVFromDrive(fileId) {
  const exportUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  console.log('📥 Téléchargement du fichier CSV...');
  const response = await fetch(exportUrl);

  if (!response.ok) {
    throw new Error(`❌ Erreur téléchargement CSV : ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  console.log('📥 Fichier CSV téléchargé');
  return Buffer.from(buffer).toString('utf-8');
}

function extractUniqueValidMatches(csvData) {
  const records = parse(csvData, {
    columns: true,
    skip_empty_lines: true
  });

  const seenGameIds = new Set();
  const matches = [];
  let ignored = 0;

  for (const row of records) {
    const gameid = row['gameid'];
    const teamname = row['teamname'];
    const side = row['side'];

    if (!gameid || teamname === 'Unknown Team') {
      ignored++;
      continue;
    }

    if (!seenGameIds.has(gameid)) {
      seenGameIds.add(gameid);
      matches.push({ gameid });
    }
  }

  return { matches, ignored, total: records.length };
}

async function fetchAllMatchIdsFromSupabase() {
  let allIds = [];
  let from = 0;
  const chunk = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('matches')
      .select('id')
      .range(from, from + chunk - 1);

    if (error) throw new Error(`❌ Erreur Supabase : ${error.message}`);
    if (!data.length) break;

    allIds = [...allIds, ...data.map(d => d.id)];
    from += chunk;
  }

  return allIds;
}

async function main() {
  try {
    const csv = await downloadCSVFromDrive(FILE_ID);
    const { matches, ignored, total } = extractUniqueValidMatches(csv);

    console.log(`🔍 Total lignes CSV : ${total}`);
    console.log(`🛑 Lignes ignorées avec Unknown Team : ${ignored}`);
    console.log(`🧩 Matchs uniques valides trouvés : ${matches.length}`);

    const existingIds = await fetchAllMatchIdsFromSupabase();
    console.log(`🧠 Matchs trouvés dans Supabase (réels) : ${existingIds.length}`);

    const newMatches = matches.filter(m => !existingIds.includes(m.gameid));
    console.log(`🆕 Nouveaux matchs à importer : ${newMatches.length}`);

    if (newMatches.length > 0) {
      console.log('🧾 Liste des gameid considérés comme nouveaux :');
      newMatches.forEach(m => console.log(`➡️ ${m.gameid}`));
    }
  } catch (err) {
    console.error('❌ Erreur générale :', err.message);
    process.exit(1);
  }
}

main();