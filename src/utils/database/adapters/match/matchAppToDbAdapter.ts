
/**
 * Adapter for converting application match format to database model
 */

import { Match } from "@/utils/models/types";
import { RawDatabaseMatch } from "./matchTypes";
import { parseGameNumber } from "./matchUtils";

/**
 * Adapt an application Match model to a format suitable for database insertion
 */
export const adaptMatchForDatabase = (match: Match): RawDatabaseMatch => {
  // Convert game_number to a number if it's a string
  const gameNumber = parseGameNumber(match.extraStats?.game_number);

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
