
import { Team } from "@/utils/models/types";

/**
 * Type definition for team data as stored in the database
 */
export interface DatabaseTeam {
  teamid: string;
  teamname: string;
  logo?: string | null;
  region?: string;
  winrate: number;
  winrate_blue: number;
  winrate_red: number;
  avg_gamelength: number;
  avg_towers: number;
  firstblood_pct: number;
  firstblood_blue_pct: number;
  firstblood_red_pct: number;
  avg_dragons: number;
  total_infernals: number;
  total_mountains: number;
  total_clouds: number;
  total_oceans: number;
  total_chemtechs: number;
  total_hextechs: number;
  avg_kills: number;
  avg_kill_diff: number;
  firstdragon_pct: number;
  avg_dragons_against: number;
  avg_towers_against: number;
  avg_heralds: number;
  avg_void_grubs: number;
  // Additional fields as needed
}

// For RawDatabaseTeam
export type RawDatabaseTeam = Partial<DatabaseTeam>;

/**
 * Adapter to convert database team format to application Team model
 */
export const adaptTeamFromDatabase = (dbTeam: any): Team => {
  return {
    id: dbTeam.teamid || '',
    name: dbTeam.teamname || '',
    logo: dbTeam.logo || null,
    region: dbTeam.region || 'Unknown',
    winRate: dbTeam.winrate || 0,
    blueWinRate: dbTeam.winrate_blue || 0,
    redWinRate: dbTeam.winrate_red || 0,
    averageGameTime: dbTeam.avg_gamelength || 0,
    
    // Objective statistics
    firstblood_pct: dbTeam.firstblood_pct || 0,
    blueFirstBlood: dbTeam.firstblood_blue_pct || 0,
    redFirstBlood: dbTeam.firstblood_red_pct || 0,
    
    firstdragon_pct: dbTeam.firstdragon_pct || 0,
    blueFirstDragon: dbTeam.blue_firstdragon_pct || dbTeam.firstblood_blue_pct || 0,
    redFirstDragon: dbTeam.red_firstdragon_pct || dbTeam.firstblood_red_pct || 0,
    
    blueFirstHerald: dbTeam.blue_firstherald_pct || 0,
    redFirstHerald: dbTeam.red_firstherald_pct || 0,
    
    blueFirstTower: dbTeam.blue_firsttower_pct || 0,
    redFirstTower: dbTeam.red_firsttower_pct || 0,
    
    blueFirstBaron: dbTeam.blue_firstbaron_pct || 0,
    redFirstBaron: dbTeam.red_firstbaron_pct || 0,
    
    // Other stats
    avg_dragons: dbTeam.avg_dragons || 0,
    avg_dragons_against: dbTeam.avg_dragons_against || 0,
    avg_towers: dbTeam.avg_towers || 0,
    avg_towers_against: dbTeam.avg_towers_against || 0,
    avg_kills: dbTeam.avg_kills || 0,
    avg_kill_diff: dbTeam.avg_kill_diff || 0,
    avg_heralds: dbTeam.avg_heralds || 0,
    avg_void_grubs: dbTeam.avg_void_grubs || 0,
    
    // Team summary view fields
    aggression_score: dbTeam.aggression_score || 0,
    earlygame_score: dbTeam.earlygame_score || 0,
    objectives_score: dbTeam.objectives_score || 0,
    dragon_diff: dbTeam.dragon_diff || 0,
    tower_diff: dbTeam.tower_diff || 0
  };
};

/**
 * Adapter to convert application Team model to database format
 */
export const adaptTeamForDatabase = (team: Team): RawDatabaseTeam => {
  return {
    teamid: team.id,
    teamname: team.name,
    logo: team.logo || null,
    region: team.region || 'Unknown',
    winrate: team.winRate || 0,
    winrate_blue: team.blueWinRate || 0,
    winrate_red: team.redWinRate || 0,
    avg_gamelength: team.averageGameTime || 0,
    avg_towers: team.avg_towers || 0,
    firstblood_pct: team.firstblood_pct || 0,
    firstblood_blue_pct: team.blueFirstBlood || 0,
    firstblood_red_pct: team.redFirstBlood || 0,
    avg_dragons: team.avg_dragons || 0,
    total_infernals: 0, // Not mapping this from Team model for now
    total_mountains: 0, // Not mapping this from Team model for now
    total_clouds: 0, // Not mapping this from Team model for now
    total_oceans: 0, // Not mapping this from Team model for now
    total_chemtechs: 0, // Not mapping this from Team model for now
    total_hextechs: 0, // Not mapping this from Team model for now
    avg_kills: team.avg_kills || 0,
    avg_kill_diff: team.avg_kill_diff || 0,
    firstdragon_pct: team.firstdragon_pct || 0,
    avg_dragons_against: team.avg_dragons_against || 0,
    avg_towers_against: team.avg_towers_against || 0,
    avg_heralds: team.avg_heralds || 0,
    avg_void_grubs: team.avg_void_grubs || 0
  };
};
