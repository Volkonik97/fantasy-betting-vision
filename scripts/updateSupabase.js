import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import csv from 'csv-parser';
import { createClient } from '@supabase/supabase-js';

// ✅ Chargement des variables d’environnement
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

async function downloadCSV(fileId) {
  const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Erreur téléchargement : ${response.statusText}`);
  return await response.text();
}

function parseCSV(content) {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = require('stream');
    const buffer = Buffer.from(content);
    const readable = new stream.Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);
    readable
      .pipe(csv())
      .on('data', data => results.push(data))
      .on('end', () => resolve(results))
      .on('error', err => reject(err));
  });
}

async function getAllGameIdsFromSupabase() {
  const allIds = new Set();
  let from = 0;
  const step = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('matches')
      .select('id')
      .range(from, from + step - 1);

    if (error) {
      console.error('❌ Erreur récupération matchs Supabase :', error.message);
      break;
    }

    if (!data || data.length === 0) break;

    for (const match of data) {
      allIds.add(match.id);
    }

    from += step;
  }

  return allIds;
}

function isValidRow(row) {
  return (
    row.gameid &&
    row.teamname &&
    row.teamname !== 'unknown team' &&
    row.side &&
    row.result
  );
}

async function main() {
  try {
    console.log('📥 Téléchargement du fichier CSV...');
    const csvText = await downloadCSV(FILE_ID);
    console.log('📥 Fichier CSV téléchargé');

    const rows = await parseCSV(csvText);
    console.log(`🔍 Total lignes CSV : ${rows.length}`);

    const matchesById = {};
    let unknownTeamRows = 0;

    for (const row of rows) {
      if (!isValidRow(row)) continue;

      const id = row.gameid;
      if (!matchesById[id]) matchesById[id] = [];

      matchesById[id].push(row);
    }

    // Filtrage des matchs avec "unknown team"
    for (const [id, matchRows] of Object.entries(matchesById)) {
      const hasUnknown = matchRows.some(r => r.teamname === 'unknown team');
      if (hasUnknown) {
        unknownTeamRows++;
        delete matchesById[id];
        console.log(`🚫 Ignoré ${id} (Unknown Team détectée)`);
      }
    }

    console.log(`🛑 Lignes ignorées avec Unknown Team : ${unknownTeamRows}`);
    const validMatchIds = Object.keys(matchesById);
    console.log(`🧩 Matchs uniques valides trouvés : ${validMatchIds.length}`);

    const existingIds = await getAllGameIdsFromSupabase();
    console.log(`🧠 Matchs trouvés dans Supabase (réels) : ${existingIds.size}`);

    const newMatches = validMatchIds.filter(id => !existingIds.has(id));
    console.log(`🆕 Nouveaux matchs à importer : ${newMatches.length}`);

    if (newMatches.length > 0) {
      console.log('🧾 Liste des gameid considérés comme nouveaux :');
      newMatches.forEach(id => console.log(`➡️ ${id}`));
    }

    for (const id of newMatches) {
      const rows = matchesById[id];
      if (!rows || rows.length !== 2) {
        console.warn(`⚠️ Skipped ${id}, données incomplètes`);
        continue;
      }

      const blueRow = rows.find(r => r.side === 'Blue');
      const redRow = rows.find(r => r.side === 'Red');

      if (!blueRow || !redRow) {
        console.warn(`⚠️ Données manquantes pour ${id}`);
        continue;
      }

      const matchData = {
        id: id,
        tournament: blueRow.league,
        date: blueRow.datacompleteness === 'complete' ? blueRow.date : null,
        team_blue_id: blueRow.teamid,
        team_red_id: redRow.teamid,
        patch: blueRow.patch,
        duration: blueRow.gamelength,
        score_blue: parseInt(blueRow.result),
        score_red: parseInt(redRow.result),
        winner_team_id: blueRow.result === '1' ? blueRow.teamid : redRow.teamid,
        first_blood: blueRow.firstblood === '1' ? 'Blue' : 'Red',
        first_dragon: blueRow.firstdragon === '1' ? 'Blue' : redRow.firstdragon === '1' ? 'Red' : null,
        first_baron: blueRow.firstbaron === '1' ? 'Blue' : redRow.firstbaron === '1' ? 'Red' : null,
        first_herald: blueRow.firstherald === '1' ? 'Blue' : redRow.firstherald === '1' ? 'Red' : null,
        first_tower: blueRow.firsttower === '1' ? 'Blue' : redRow.firsttower === '1' ? 'Red' : null,
        year: blueRow.split.split(' ')[0],
        split: blueRow.split.split(' ')[1],
        game_completeness: blueRow.datacompleteness,
        playoffs: blueRow.playoffs === '1',
      };

      const { error: insertError } = await supabase.from('matches').insert(matchData);
      if (insertError) {
        console.error(`❌ Erreur insertion match ${id}:`, insertError.message);
        continue;
      }

      console.log(`✅ Importé : ${id}`);
    }
  } catch (err) {
    console.error('❌ Erreur générale :', err);
    process.exit(1);
  }
}

main();
