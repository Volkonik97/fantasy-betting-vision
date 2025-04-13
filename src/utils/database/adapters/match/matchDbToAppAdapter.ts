
/**
 * Adapter for converting database match format to application model
 */

import { Match } from "@/utils/models/types";
import { RawDatabaseMatch } from "./matchTypes";

/**
 * Adapt a raw database match object to our application Match model
 */
export const adaptMatchFromDatabase = (data: RawDatabaseMatch): Match => {
  return {
    id: data.id || data.gameid || '',
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
      first_blood: data.firstblood_team_id || (typeof data.first_blood === 'string' ? data.first_blood : null),
      first_dragon: data.firstdragon_team_id || (typeof data.first_dragon === 'string' ? data.first_dragon : null),
      first_baron: data.firstbaron_team_id || (typeof data.first_baron === 'string' ? data.first_baron : null),
      first_tower: data.firsttower_team_id || (typeof data.first_tower === 'string' ? data.first_tower : null),
      first_herald: typeof data.first_herald === 'string' ? data.first_herald : null,
      game_number: data.game_number
    }
  };
};
