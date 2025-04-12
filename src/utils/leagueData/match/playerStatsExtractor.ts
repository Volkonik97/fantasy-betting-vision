
import { LeagueGameDataRow } from "../../csv/types";

// Define a local interface since it can't find the imported one
interface PlayerMatchStats {
  player_id: string;
  match_id: string;
  team_id: string;
  champion: string;
  position: string;
  kills: number;
  deaths: number;
  assists: number;
  gold: number;
  cs: number;
  dpm: number;
  gold_at_10?: number;
  gold_at_15?: number;
  cs_at_10?: number;
  cs_at_15?: number;
  kills_at_10?: number;
  kills_at_15?: number;
  assists_at_10?: number;
  assists_at_15?: number;
  deaths_at_10?: number;
  deaths_at_15?: number;
}

export function extractPlayerStats(row: LeagueGameDataRow): PlayerMatchStats | null {
  if (!row.playerid || !row.gameid || !row.teamid) {
    return null;
  }

  const playerStats: PlayerMatchStats = {
    player_id: row.playerid,
    match_id: row.gameid,
    team_id: row.teamid,
    champion: row.champion || "",
    position: row.position || "",
    kills: parseInt(row.kills as string) || 0,
    deaths: parseInt(row.deaths as string) || 0,
    assists: parseInt(row.assists as string) || 0,
    gold: parseInt(row.totalgold as string) || 0,
    cs: parseInt(row.total_cs as string) || 0,
    dpm: parseInt(row.dpm as string) || 0
  };

  // Add timeline stats if available
  if (row.goldat10) {
    playerStats.gold_at_10 = parseInt(row.goldat10 as string) || 0;
  }
  
  if (row.goldat15) {
    playerStats.gold_at_15 = parseInt(row.goldat15 as string) || 0;
  }
  
  if (row.csat10) {
    playerStats.cs_at_10 = parseInt(row.csat10 as string) || 0;
  }
  
  if (row.csat15) {
    playerStats.cs_at_15 = parseInt(row.csat15 as string) || 0;
  }
  
  if (row.killsat10) {
    playerStats.kills_at_10 = parseInt(row.killsat10 as string) || 0;
  }
  
  if (row.killsat15) {
    playerStats.kills_at_15 = parseInt(row.killsat15 as string) || 0;
  }
  
  if (row.assistsat10) {
    playerStats.assists_at_10 = parseInt(row.assistsat10 as string) || 0;
  }
  
  if (row.assistsat15) {
    playerStats.assists_at_15 = parseInt(row.assistsat15 as string) || 0;
  }
  
  if (row.deathsat10) {
    playerStats.deaths_at_10 = parseInt(row.deathsat10 as string) || 0;
  }
  
  if (row.deathsat15) {
    playerStats.deaths_at_15 = parseInt(row.deathsat15 as string) || 0;
  }

  return playerStats;
}
