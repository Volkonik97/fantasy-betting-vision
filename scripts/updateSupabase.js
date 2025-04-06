import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import csv from 'csv-parser';
import { Readable } from 'stream';

// ✅ Vérification des secrets d'environnement
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

async function fetchCSVFromDrive(fileId) {
  const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
  console.log('📥 Téléchargement du fichier CSV...');
  const response = await fetch(url);
  if (!response.ok) throw new Error('Erreur lors du téléchargement du fichier.');
  const buffer = await response.buffer();
  console.log('📥 Fichier CSV téléchargé');
  return buffer;
}

function parseCSV(buffer) {
  return new Promise((resolve, reject) => {
    const results = [];
    Readable.from([buffer])
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function fetchAllGameIdsFromSupabase() {
  let allGameIds = [];
  let from = 0;
  const batchSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('matches')
      .select('id', { count: 'exact' })
      .range(from, from + batchSize - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    allGameIds = allGameIds.concat(data.map(match => match.id));
    from += batchSize;
  }

  return allGameIds;
}

function isValidMatch(match) {
  const blue = match.teamname;
  const red = match.opp_teamname;
  return blue && red && !blue.toLowerCase().includes('unknown') && !red.toLowerCase().includes('unknown');
}

function extractUniqueMatches(csvData) {
  const uniqueMatches = new Map();

  for (const row of csvData) {
    const gameId = row.gameid?.trim();
    if (!gameId || !isValidMatch(row)) {
      console.log(`🚫 Ignoré ${gameId} (Unknown Team détectée)`);
      continue;
    }

    if (!uniqueMatches.has(gameId)) {
      uniqueMatches.set(gameId, row);
    }
  }

  return uniqueMatches;
}

function convertToMatchRow(row) {
  return {
    id: row.gameid,
    tournament: row.league,
    date: row.date,
    team_blue_id: row.teamid,
    team_red_id: row.opp_teamid,
    patch: row.patch,
    duration: row.gamelength,
    score_blue: parseInt(row.teamkills) || null,
    score_red: parseInt(row.opp_kills) || null,
    winner_team_id: row.teamid === row.winner ? row.teamid : row.opp_teamid,
    first_blood: row.firstblood === '1' ? 'blue' : 'red',
    first_dragon: row.firstdragon === '1' ? 'blue' : 'red',
    first_baron: row.firstbaron === '1' ? 'blue' : 'red',
    first_herald: row.firstherald === '1' ? 'blue' : 'red',
    first_tower: row.firsttower === '1' ? 'blue' : 'red',
    first_mid_tower: row.firstmidtower === '1' ? 'blue' : 'red',
    dragons: parseInt(row.dragons) || 0,
    opp_dragons: parseInt(row.opp_dragons) || 0,
    barons: parseInt(row.barons) || 0,
    opp_barons: parseInt(row.opp_barons) || 0,
    heralds: parseInt(row.heralds) || 0,
    opp_heralds: parseInt(row.opp_heralds) || 0,
    towers: parseInt(row.towers) || 0,
    opp_towers: parseInt(row.opp_towers) || 0,
    inhibitors: parseInt(row.inhibitors) || 0,
    opp_inhibitors: parseInt(row.opp_inhibitors) || 0,
    team_kills: parseInt(row.teamkills) || 0,
    team_deaths: parseInt(row.opp_kills) || 0,
    team_kpm: parseFloat(row.ckpm) || null,
    ckpm: parseFloat(row.ckpm) || null,
    year: row.year,
    split: row.split,
    game_completeness: row.datacompleteness,
    playoffs: row.playoffs === '1',
  };
}

async function main() {
  try {
    const buffer = await fetchCSVFromDrive(GOOGLE_FILE_ID);
    const csvData = await parseCSV(buffer);
    console.log(`🔍 Total lignes CSV : ${csvData.length}`);

    const matchMap = extractUniqueMatches(csvData);
    const uniqueMatches = [...matchMap.entries()];
    console.log(`🧩 Matchs uniques valides trouvés : ${uniqueMatches.length}`);

    const existingIds = await fetchAllGameIdsFromSupabase();
    console.log(`🧠 Matchs trouvés dans Supabase (réels) : ${existingIds.length}`);

    const newMatches = uniqueMatches.filter(([id]) => !existingIds.includes(id));
    console.log(`🆕 Nouveaux matchs à importer : ${newMatches.length}`);

    if (newMatches.length > 0) {
      console.log('🧾 Liste des gameid considérés comme nouveaux :');
      newMatches.forEach(([id]) => console.log(`➡️ ${id}`));
    }

    for (const [id, row] of newMatches) {
      const match = convertToMatchRow(row);
      console.log(`📦 Données match ${id}:`, match);

      const { error } = await supabase.from('matches').insert([match]);
      if (error) {
        console.error(`❌ Erreur insertion match ${id}: ${error.message}`);
        continue;
      }

      console.log(`✅ Importé : ${id}`);
    }

  } catch (error) {
    console.error(`❌ Erreur générale : ${error.message}`);
    process.exit(1);
  }
}

main();
