import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import https from 'https';
import path from 'path';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const FILE_ID = process.env.FILE_ID;

console.log(`🔒 SUPABASE_URL: ${SUPABASE_URL ? '✅' : '❌'}`);
console.log(`🔒 SUPABASE_KEY: ${SUPABASE_KEY ? '✅' : '❌'}`);
console.log(`🔒 FILE_ID: ${FILE_ID ? '✅' : '❌'}`);

if (!SUPABASE_URL || !SUPABASE_KEY || !FILE_ID) {
  console.error('❌ Erreur : un ou plusieurs secrets manquent.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const downloadCSV = async () => {
  const fileUrl = `https://drive.google.com/uc?export=download&id=${FILE_ID}`;
  const localPath = path.join('scripts', 'data.csv');

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(localPath);
    https.get(fileUrl, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('📥 Fichier CSV téléchargé');
        resolve(localPath);
      });
    }).on('error', reject);
  });
};

const parseCSV = (filePath) => {
  const raw = fs.readFileSync(filePath);
  const rows = parse(raw, {
    columns: true,
    skip_empty_lines: true
  });
  return rows;
};

const filterValidMatches = (rows) => {
  const matchMap = new Map();
  let ignored = 0;

  for (const row of rows) {
    const gameid = row.gameid;
    const blueTeam = row.teamname;
    const redTeam = row.opp_teamname;

    if (!gameid || blueTeam === 'Unknown Team' || redTeam === 'Unknown Team') {
      ignored++;
      console.log(`🚫 Ignoré ${gameid} (Unknown Team détectée)`);
      continue;
    }

    if (!matchMap.has(gameid)) {
      matchMap.set(gameid, row);
    }
  }

  return { uniqueMatches: Array.from(matchMap.values()), ignored };
};

const getExistingGameIds = async () => {
  const { data, error } = await supabase
    .from('matches')
    .select('id');

  if (error) {
    console.error('❌ Erreur lecture Supabase:', error);
    process.exit(1);
  }

  return new Set(data.map(row => row.id));
};

const buildMatch = (row) => ({
  id: row.gameid,
  tournament: row.league,
  date: `${row.date} ${row.game_time}`,
  team_blue_id: row.teamid,
  team_red_id: row.opp_teamid,
  patch: row.patch,
  duration: row.gamelength,
  score_blue: parseInt(row.teamkills) || null,
  score_red: parseInt(row.opp_kills) || null,
  winner_team_id: row.result === 'Win' ? row.teamid : row.opp_teamid,
  first_blood: row.firstblood === '1',
  first_dragon: row.firstdragon === '1',
  first_baron: row.firstbaron === '1',
  first_herald: row.firstherald === '1',
  first_tower: row.firsttower === '1',
  first_mid_tower: row.firstmidtower === '1',
  first_three_towers: row.had_firstthree === '1',
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
  team_deaths: parseInt(row.deaths) || 0,
  team_kpm: parseFloat(row.ckpm) || null,
  ckpm: parseFloat(row.ckpm) || null,
  year: row.year,
  split: row.split,
  game_completeness: row.datacompleteness,
  playoffs: row.playoffs === 'TRUE'
});

const insertMatches = async (matches) => {
  for (const match of matches) {
    const formatted = buildMatch(match);
    const { error } = await supabase.from('matches').insert(formatted);
    if (error) {
      console.error(`❌ Erreur insertion match ${match.gameid}:`, error.message);
    } else {
      console.log(`✅ Importé : ${match.gameid}`);
    }
  }
};

(async () => {
  const filePath = await downloadCSV();
  const rows = parseCSV(filePath);
  console.log(`🔍 Total lignes CSV : ${rows.length}`);

  const { uniqueMatches, ignored } = filterValidMatches(rows);
  console.log(`🛑 Lignes ignorées avec Unknown Team : ${ignored}`);
  console.log(`🧩 Matchs uniques valides trouvés : ${uniqueMatches.length}`);

  const existingIds = await getExistingGameIds();
  const newMatches = uniqueMatches.filter(row => !existingIds.has(row.gameid));
  console.log(`🧠 Matchs trouvés dans Supabase (réels) : ${existingIds.size}`);
  console.log(`🆕 Nouveaux matchs à importer : ${newMatches.length}`);

  if (newMatches.length > 0) {
    console.log('🧾 Liste des gameid considérés comme nouveaux :');
    newMatches.forEach(row => console.log(`➡️ ${row.gameid}`));
    await insertMatches(newMatches);
  } else {
    console.log('✅ Aucun nouveau match à importer.');
  }
})();
