import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { parse } from 'csv-parse';
import { createClient } from '@supabase/supabase-js';

// 🧪 Chargement des secrets
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const FILE_ID = process.env.FILE_ID || '1v6LRphp2kYciU4SXp0PCjEMuev1bDejc'; // ID par défaut

console.log('🔒 SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
console.log('🔒 SUPABASE_KEY:', SUPABASE_KEY ? '✅' : '❌');
console.log('🔒 FILE_ID:', FILE_ID ? '✅' : '❌');

if (!SUPABASE_URL || !SUPABASE_KEY || !FILE_ID) {
  console.error('❌ Erreur : un ou plusieurs secrets manquent.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const downloadUrl = `https://drive.google.com/uc?export=download&id=${FILE_ID}`;
const csvPath = './match_data.csv';

// 📥 Téléchargement du fichier CSV
const downloadCSV = async () => {
  const res = await fetch(downloadUrl);
  if (!res.ok) throw new Error(`Échec du téléchargement : ${res.statusText}`);
  const fileStream = fs.createWriteStream(csvPath);
  await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on('error', reject);
    fileStream.on('finish', resolve);
  });
};

// 📊 Lecture et parsing du CSV
const parseCSV = async () => {
  const records = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(parse({ columns: true }))
      .on('data', (row) => records.push(row))
      .on('end', () => resolve(records))
      .on('error', reject);
  });
};

// 🧠 Récupération des match_id depuis Supabase
const fetchExistingGameIds = async () => {
  const { data, error, count } = await supabase
    .from('matches')
    .select('id', { count: 'exact' });
  if (error) throw error;
  const ids = new Set(data.map((row) => row.id));
  return { ids, count };
};

// 🔁 Insertion des nouveaux matchs
const insertMatches = async (matches) => {
  for (const match of matches) {
    try {
      const { error } = await supabase.from('matches').insert([match]);
      if (error) {
        console.error(`❌ Erreur insertion match ${match.id}: ${error.message}`);
      } else {
        console.log(`✅ Importé : ${match.id}`);
      }
    } catch (e) {
      console.error(`❌ Exception sur match ${match.id}:`, e);
    }
  }
};

// 🧠 Traitement principal
const main = async () => {
  try {
    await downloadCSV();
    console.log('📥 Fichier CSV téléchargé');

    const allRows = await parseCSV();
    console.log(`🔍 Total lignes CSV : ${allRows.length}`);

    const filteredMatches = [];
    const unknownSkipped = [];
    const seenIds = new Set();

    for (const row of allRows) {
      const id = row['gameid'];
      const blueTeam = row['teamname'];
      const redTeam = row['opponentname'];
      if (!id || !blueTeam || !redTeam || blueTeam === 'Unknown Team' || redTeam === 'Unknown Team') {
        unknownSkipped.push(id);
        continue;
      }
      if (!seenIds.has(id)) {
        seenIds.add(id);

        filteredMatches.push({
          id,
          tournament: row['league'],
          date: `${row['gamedate']} ${row['gamelength']}`,
          team_blue_id: blueTeam,
          team_red_id: redTeam,
          patch: row['patch'],
          duration: row['gamelength'],
          score_blue: parseInt(row['teamkills']) || 0,
          score_red: parseInt(row['opponentkills']) || 0,
          winner_team_id: row['result'] === 'Win' ? blueTeam : redTeam,
          first_blood: row['firstblood'],
          first_dragon: row['firstdragon'],
          first_baron: row['firstbaron'],
          first_herald: row['firstherald'],
          first_tower: row['firsttower'],
          first_mid_tower: row['firstmidtower'],
          first_three_towers: row['first3tower'],
          dragons: parseInt(row['dragons']) || 0,
          opp_dragons: parseInt(row['opp_dragons']) || 0,
          barons: parseInt(row['barons']) || 0,
          opp_barons: parseInt(row['opp_barons']) || 0,
          heralds: parseInt(row['heralds']) || 0,
          opp_heralds: parseInt(row['opp_heralds']) || 0,
          towers: parseInt(row['towers']) || 0,
          opp_towers: parseInt(row['opp_towers']) || 0,
          inhibitors: parseInt(row['inhibitors']) || 0,
          opp_inhibitors: parseInt(row['opp_inhibitors']) || 0,
          team_kills: parseInt(row['teamkills']) || 0,
          team_deaths: parseInt(row['deaths']) || 0,
          team_kpm: parseFloat(row['team kpm']) || null,
          ckpm: parseFloat(row['ckpm']) || null,
          year: row['season'].split(' ')[0],
          split: row['season'].split(' ')[1],
          game_completeness: row['gameid'].startsWith('lol') ? 'complete' : 'partial',
          playoffs: row['playoffs'] === 'TRUE',
        });
      }
    }

    console.log(`🛑 Lignes ignorées avec Unknown Team : ${unknownSkipped.length}`);
    console.log(`🧩 Matchs uniques valides trouvés : ${filteredMatches.length}`);

    const { ids: existingIds, count } = await fetchExistingGameIds();
    console.log(`🧠 Matchs trouvés dans Supabase (réels) : ${count}`);

    const newMatches = filteredMatches.filter((m) => !existingIds.has(m.id));
    console.log(`🆕 Nouveaux matchs à importer : ${newMatches.length}`);

    if (newMatches.length) {
      console.log('🧾 Liste des gameid considérés comme nouveaux :');
      newMatches.forEach((m) => console.log(`➡️ ${m.id}`));
    }

    await insertMatches(newMatches);
  } catch (error) {
    console.error('❌ ERREUR GLOBALE:', error);
    process.exit(1);
  }
};

main();