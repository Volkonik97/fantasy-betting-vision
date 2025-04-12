
/**
 * Adapter module to handle database schema and model mismatches.
 * This helps with type safety while allowing us to work with both database and application models.
 */

import { Match } from "@/utils/models/types";

/**
 * Represents the raw match structure as returned from the database
 */
export interface RawDatabaseMatch {
  id?: string;
  gameid: string;
  firstbaron_team_id?: string;
  firstblood_team_id?: string;
  firstdragon_team_id?: string;
  firsttower_team_id?: string;
  game_number?: number;
  gamelength?: number;
  patch?: string;
  year?: number;
  team1_id?: string;
  team2_id?: string;
  team1_name?: string;
  team2_name?: string;
  team1_region?: string;
  team2_region?: string;
  team_blue_id?: string;
  team_red_id?: string;
  team_blue_name?: string;
  team_red_name?: string;
  team_blue_region?: string;
  team_red_region?: string;
  winner_team_id?: string;
  score_blue?: number;
  score_red?: number;
  duration?: string;
  mvp?: string;
  status?: "Upcoming" | "Live" | "Completed";
  tournament?: string;
  date?: string;
  predicted_winner?: string;
  blue_win_odds?: number;
  red_win_odds?: number;
  split?: string;
  playoffs?: boolean;
  team_kpm?: number;
  ckpm?: number;
  team_kills?: number;
  team_deaths?: number;
  dragons?: number;
  heralds?: number;
  barons?: number;
  first_blood?: string | boolean;
  first_dragon?: string | boolean;
  first_baron?: string | boolean;
  first_tower?: string | boolean;
  first_herald?: string | boolean;
  // Add any other database fields here
}

/**
 * Adapt a raw database match object to our application Match model
 */
export const adaptMatchFromDatabase = (data: RawDatabaseMatch): Match => {
  return {
    id: data.id || data.gameid,
    tournament: data.tournament || 'Unknown',
    date: data.date || new Date().toISOString(),
    teamBlue: {
      id: data.team_blue_id || data.team1_id || '',
      name: data.team_blue_name || data.team1_name || "Équipe Bleue",
      region: data.team_blue_region || data.team1_region || "Unknown",
      logo: "",
      winRate: 0,
      blueWinRate: 0,
      redWinRate: 0,
      averageGameTime: 0
    },
    teamRed: {
      id: data.team_red_id || data.team2_id || '',
      name: data.team_red_name || data.team2_name || "Équipe Rouge",
      region: data.team_red_region || data.team2_region || "Unknown",
      logo: "",
      winRate: 0,
      blueWinRate: 0,
      redWinRate: 0,
      averageGameTime: 0
    },
    status: data.status || "Completed",
    predictedWinner: data.predicted_winner || "",
    blueWinOdds: data.blue_win_odds || 0.5,
    redWinOdds: data.red_win_odds || 0.5,
    result: {
      winner: data.winner_team_id || '',
      score: [data.score_blue || 0, data.score_red || 0],
      duration: data.duration || (data.gamelength?.toString() || "0"),
      mvp: data.mvp || ""
    },
    extraStats: {
      patch: data.patch || '',
      year: data.year?.toString() || '',
      split: data.split || '',
      playoffs: !!data.playoffs,
      team_kpm: data.team_kpm || 0,
      ckpm: data.ckpm || 0,
      team_kills: data.team_kills || 0,
      team_deaths: data.team_deaths || 0,
      dragons: data.dragons || 0,
      heralds: data.heralds || 0,
      barons: data.barons || 0,
      first_blood: data.firstblood_team_id || data.first_blood || null,
      first_dragon: data.firstdragon_team_id || data.first_dragon || null,
      first_baron: data.firstbaron_team_id || data.first_baron || null,
      first_tower: data.firsttower_team_id || data.first_tower || null,
      first_herald: data.first_herald || null,
      game_number: data.game_number
    }
  };
};

/**
 * Adapt an application Match model to a format suitable for database insertion
 */
export const adaptMatchForDatabase = (match: Match): RawDatabaseMatch => {
  // Convert game_number to a number if it's a string
  let gameNumber: number | undefined = undefined;
  if (match.extraStats?.game_number !== undefined) {
    if (typeof match.extraStats.game_number === 'string') {
      gameNumber = parseInt(match.extraStats.game_number, 10);
      if (isNaN(gameNumber)) gameNumber = undefined;
    } else {
      gameNumber = match.extraStats.game_number as number;
    }
  }

  return {
    gameid: match.id,
    id: match.id, // Some operations might use id instead of gameid
    tournament: match.tournament,
    date: match.date,
    team_blue_id: match.teamBlue.id,
    team_red_id: match.teamRed.id,
    team_blue_name: match.teamBlue.name,
    team_red_name: match.teamRed.name,
    team_blue_region: match.teamBlue.region,
    team_red_region: match.teamRed.region,
    winner_team_id: match.result?.winner,
    score_blue: match.result?.score[0] || 0,
    score_red: match.result?.score[1] || 0,
    duration: match.result?.duration?.toString(),
    mvp: match.result?.mvp,
    status: match.status,
    predicted_winner: match.predictedWinner,
    blue_win_odds: match.blueWinOdds,
    red_win_odds: match.redWinOdds,
    patch: match.extraStats?.patch,
    year: match.extraStats?.year ? parseInt(match.extraStats.year) : undefined,
    split: match.extraStats?.split,
    playoffs: match.extraStats?.playoffs,
    team_kpm: match.extraStats?.team_kpm,
    ckpm: match.extraStats?.ckpm,
    team_kills: match.extraStats?.team_kills,
    team_deaths: match.extraStats?.team_deaths,
    dragons: match.extraStats?.dragons,
    heralds: match.extraStats?.heralds,
    barons: match.extraStats?.barons,
    first_blood: match.extraStats?.first_blood,
    first_dragon: match.extraStats?.first_dragon,
    first_baron: match.extraStats?.first_baron,
    first_tower: match.extraStats?.first_tower,
    first_herald: match.extraStats?.first_herald,
    game_number: gameNumber
  };
};

/**
 * Safely convert any value to a boolean in string form for database storage
 */
export const booleanToString = (value: any): string | null => {
  if (value === undefined || value === null) return null;
  
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  
  if (typeof value === 'string') {
    const lowercaseValue = value.toLowerCase().trim();
    if (['true', '1', 'yes', 'oui', 't', 'y'].includes(lowercaseValue)) {
      return 'true';
    }
    if (['false', '0', 'no', 'non', 'f', 'n'].includes(lowercaseValue)) {
      return 'false';
    }
    
    // If it doesn't match any boolean pattern, return it as is
    // It might be an ID or other string value
    return value;
  }
  
  if (typeof value === 'number') {
    return value === 1 ? 'true' : 'false';
  }
  
  return null;
};
