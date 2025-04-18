
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
  avg_golddiffat15?: number;
  avg_xpdiffat15?: number;
  avg_csdiffat15?: number;
  // Additional fields as needed
}

// Type for team data from team_summary_view
export interface TeamSummaryViewData {
  teamid: string;
  teamname: string;
  logo?: string | null;
  region?: string;
  winrate_percent?: number;
  winrate_blue_percent?: number;
  winrate_red_percent?: number;
  avg_gamelength: number;
  avg_towers: number;
  firstblood_pct: number;
  avg_dragons: number;
  avg_kills: number;
  avg_kill_diff: number;
  firstdragon_pct: number;
  avg_dragons_against: number;
  avg_towers_against: number;
  avg_heralds: number;
  avg_void_grubs: number;
  aggression_score?: number;
  earlygame_score?: number;
  objectives_score?: number;
  dragon_diff?: number;
  tower_diff?: number;
  avg_golddiffat15?: number;
  avg_xpdiffat15?: number;
  avg_csdiffat15?: number;
}

// For RawDatabaseTeam
export type RawDatabaseTeam = Partial<DatabaseTeam | TeamSummaryViewData>;

/**
 * Adapter to convert database team format to application Team model
 */
export const adaptTeamFromDatabase = (dbTeam: any): Team => {
  // Safety check for existence of dbTeam
  if (!dbTeam) {
    console.error("Attempted to adapt undefined or null dbTeam");
    return {
      id: '',
      name: '',
      logo: '', // Added missing logo property
      region: 'Unknown',
      winRate: 0,
      blueWinRate: 0,
      redWinRate: 0,
      averageGameTime: 0,
      players: []
    };
  }

  // Determine if we're dealing with team_summary_view data or regular teams table data
  const isFromSummaryView = 'winrate_percent' in dbTeam || 'winrate_blue_percent' in dbTeam || 'winrate_red_percent' in dbTeam;
  
  // Log the raw winrate values for debugging
  console.log(`Raw winrate values for ${dbTeam.teamname || 'unknown team'}:`, {
    isFromSummaryView: isFromSummaryView,
    winrate: dbTeam.winrate,
    winrate_percent: dbTeam.winrate_percent,
    winrate_blue: dbTeam.winrate_blue,
    winrate_blue_percent: dbTeam.winrate_blue_percent,
    winrate_red: dbTeam.winrate_red,
    winrate_red_percent: dbTeam.winrate_red_percent
  });
  
  // Handle winrates based on data source
  let winRate = 0, blueWinRate = 0, redWinRate = 0;
  
  if (isFromSummaryView) {
    // Handle team_summary_view data (percentages are already in 0-100 range)
    winRate = typeof dbTeam.winrate_percent === 'number' ? dbTeam.winrate_percent / 100 : 0;
    blueWinRate = typeof dbTeam.winrate_blue_percent === 'number' ? dbTeam.winrate_blue_percent / 100 : 0;
    redWinRate = typeof dbTeam.winrate_red_percent === 'number' ? dbTeam.winrate_red_percent / 100 : 0;
  } else {
    // Handle regular teams table data (usually in 0-1 range)
    winRate = typeof dbTeam.winrate === 'number' ? dbTeam.winrate : parseFloat(String(dbTeam.winrate || '0'));
    blueWinRate = typeof dbTeam.winrate_blue === 'number' ? dbTeam.winrate_blue : parseFloat(String(dbTeam.winrate_blue || '0'));
    redWinRate = typeof dbTeam.winrate_red === 'number' ? dbTeam.winrate_red : parseFloat(String(dbTeam.winrate_red || '0'));
  }
  
  // Log the converted values for debugging
  console.log(`Converted winrate values for ${dbTeam.teamname || 'unknown team'}:`, {
    winRate, blueWinRate, redWinRate
  });
  
  return {
    id: dbTeam.teamid || '',
    name: dbTeam.teamname || '',
    logo: dbTeam.logo || null,
    region: dbTeam.region || 'Unknown',
    winRate: winRate,
    blueWinRate: blueWinRate,
    redWinRate: redWinRate,
    averageGameTime: dbTeam.avg_gamelength || 0,
    
    // Always initialize players as an empty array
    players: Array.isArray(dbTeam.players) ? dbTeam.players : [],
    
    // Objective statistics
    firstblood_pct: dbTeam.firstblood_pct || 0,
    blueFirstBlood: dbTeam.firstblood_blue_pct || 0,
    redFirstBlood: dbTeam.firstblood_red_pct || 0,
    
    firstdragon_pct: dbTeam.firstdragon_pct || 0,
    blueFirstDragon: dbTeam.blue_firstdragon_pct || 0,
    redFirstDragon: dbTeam.red_firstdragon_pct || 0,
    
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
    tower_diff: dbTeam.tower_diff || 0,
    
    // Additional fields
    avg_golddiffat15: dbTeam.avg_golddiffat15 || 0,
    avg_xpdiffat15: dbTeam.avg_xpdiffat15 || 0,
    avg_csdiffat15: dbTeam.avg_csdiffat15 || 0
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
    avg_void_grubs: team.avg_void_grubs || 0,
    // Add mapping for additional field
    avg_golddiffat15: team.avg_golddiffat15 || 0,
    avg_xpdiffat15: team.avg_xpdiffat15 || 0,
    avg_csdiffat15: team.avg_csdiffat15 || 0
  };
};
