
/**
 * Types for database match structures
 */

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
}
