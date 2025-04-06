const { createClient } = require("@supabase/supabase-js");
const { log, error } = require("./logger");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fetchExistingGameIds() {
  let allGameIds = [];
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error: fetchError } = await supabase
      .from("matches")
      .select("gameid")
      .range(from, from + pageSize - 1);

    if (fetchError) throw fetchError;
    if (!data || data.length === 0) break;

    allGameIds.push(...data.map((row) => row.gameid));
    from += pageSize;
  }

  return allGameIds;
}

function isUnknownTeam(row) {
  return (
    row.teamname === "Unknown Team" ||
    row.teamname_1 === "Unknown Team" ||
    row.teamname_2 === "Unknown Team"
  );
}

function cleanRow(row) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key,
      value === "NaN" || value === "" ? null : value,
    ])
  );
}

async function insertData(rows) {
  const existingGameIds = await fetchExistingGameIds();
  const newRows = rows
    .filter((r) => !isUnknownTeam(r))
    .map(cleanRow)
    .filter((r) => !existingGameIds.includes(r.gameid));

  log(`🔍 ${newRows.length} nouveaux matchs à insérer.`);

  const matches = [];
  const teamStats = [];
  const playerStats = [];

  for (const row of newRows) {
    matches.push({
      gameid: row.gameid,
      league: row.league,
      split: row.split,
      date: row.date,
      patch: row.patch,
      teamname_1: row.teamname_1,
      teamname_2: row.teamname_2,
      result: row.result,
      side: row.side,
      odds_1: row.odds_1,
      odds_2: row.odds_2,
    });

    teamStats.push({
      gameid: row.gameid,
      teamname: row.teamname,
      side: row.side,
      firstblood: row.firstblood === "1",
      firstdragon: row.firstdragon === "1",
      firstbaron: row.firstbaron === "1",
      towers: parseInt(row.towers),
      dragons: parseInt(row.dragons),
      barons: parseInt(row.barons),
    });

    playerStats.push({
      gameid: row.gameid,
      playername: row.playername,
      teamname: row.teamname,
      champion: row.champion,
      kills: parseInt(row.kills),
      deaths: parseInt(row.deaths),
      assists: parseInt(row.assists),
      triplekills: parseInt(row.triplekills),
      quadrakills: parseInt(row.quadrakills),
      pentakills: parseInt(row.pentakills),
    });
  }

  await supabase.from("matches").insert(matches);
  await supabase.from("team_match_stats").insert(teamStats);
  await supabase.from("player_match_stats").insert(playerStats);

  await supabase.from("data_updates").insert([
    { source: "google_sheet", updated_at: new Date().toISOString() },
  ]);

  log(`✅ ${matches.length} matchs insérés.`);
}

module.exports = { insertData };
