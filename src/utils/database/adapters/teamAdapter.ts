
import { Team } from '@/utils/models/types';

/**
 * Interface representing the raw team data structure from the database
 */
export interface RawDatabaseTeam {
  teamid?: string;
  id?: string;
  teamname?: string;
  name?: string;
  logo?: string;
  region?: string;
  winrate?: number;
  winrate_percent?: number;
  winrate_blue?: number;
  winrate_blue_percent?: number;
  winrate_red?: number;
  winrate_red_percent?: number;
  avg_gamelength?: number;
  average_game_time?: number;
  firstblood_pct?: number;
  firstblood_blue_pct?: number;
  firstblood_red_pct?: number;
  blue_firstdragon_pct?: number;
  red_firstdragon_pct?: number;
  firstdragon_pct?: number;
  blue_firstherald_pct?: number;
  red_firstherald_pct?: number;
  blue_firsttower_pct?: number;
  red_firsttower_pct?: number;
  blue_firstbaron_pct?: number;
  red_firstbaron_pct?: number;
  // Add any other fields from the team_summary_view or teams table
}

/**
 * Adapt a raw database team to our application Team model
 */
export const adaptTeamFromDatabase = (data: RawDatabaseTeam): Team => {
  return {
    id: data.id || data.teamid || '',
    name: data.name || data.teamname || '',
    region: data.region || '',
    logo: data.logo || '',
    winRate: data.winrate || (data.winrate_percent ? data.winrate_percent / 100 : 0),
    blueWinRate: data.winrate_blue || (data.winrate_blue_percent ? data.winrate_blue_percent / 100 : 0),
    redWinRate: data.winrate_red || (data.winrate_red_percent ? data.winrate_red_percent / 100 : 0),
    averageGameTime: data.average_game_time || data.avg_gamelength || 0,
    blueFirstBlood: data.firstblood_blue_pct || 0,
    redFirstBlood: data.firstblood_red_pct || 0,
    blueFirstDragon: data.blue_firstdragon_pct || 0,
    redFirstDragon: data.red_firstdragon_pct || 0,
    blueFirstHerald: data.blue_firstherald_pct || 0,
    redFirstHerald: data.red_firstherald_pct || 0,
    blueFirstTower: data.blue_firsttower_pct || 0,
    redFirstTower: data.red_firsttower_pct || 0,
    blueFirstBaron: data.blue_firstbaron_pct || 0,
    redFirstBaron: data.red_firstbaron_pct || 0
  };
};

/**
 * Adapt an application Team model to a format suitable for database insertion
 */
export const adaptTeamForDatabase = (team: Team): RawDatabaseTeam => {
  return {
    teamid: team.id,
    teamname: team.name,
    logo: team.logo,
    region: team.region,
    winrate: team.winRate,
    winrate_blue: team.blueWinRate,
    winrate_red: team.redWinRate,
    avg_gamelength: team.averageGameTime,
    firstblood_blue_pct: team.blueFirstBlood,
    firstblood_red_pct: team.redFirstBlood,
    blue_firstdragon_pct: team.blueFirstDragon,
    red_firstdragon_pct: team.redFirstDragon,
    blue_firstherald_pct: team.blueFirstHerald,
    red_firstherald_pct: team.redFirstHerald,
    blue_firsttower_pct: team.blueFirstTower,
    red_firsttower_pct: team.redFirstTower,
    blue_firstbaron_pct: team.blueFirstBaron,
    red_firstbaron_pct: team.redFirstBaron
  };
};
