// Types for processing League data
export interface GameTracker {
  id: string;
  date: string;
  league: string;
  year: string;
  split: string;
  patch: string;
  playoffs: boolean;
  teams: {
    blue: string;
    red: string;
  };
  result?: string;
  duration?: string;
}

export interface MatchTeamStats {
  team_id: string;
  match_id: string;
  side: string;
  is_winner: boolean | null;
  team_kpm: number;
  ckpm: number;
  first_blood: boolean | null;
  team_kills: number;
  team_deaths: number;
  first_dragon: boolean | null;
  
  // Dragon statistics
  dragons: number;
  elemental_drakes: number;
  infernals: number;
  mountains: number;
  clouds: number;
  oceans: number;
  chemtechs: number;
  hextechs: number;
  drakes_unknown: number;
  
  elders: number;
  first_herald: boolean | null;
  heralds: number;
  first_baron: boolean | null;
  barons: number;
  void_grubs: number;
  first_tower: boolean | null;
  first_mid_tower: boolean | null;
  first_three_towers: boolean | null;
  towers: number;
  turret_plates: number;
  inhibitors: number;
}

export interface PlayerMatchStats {
  participant_id: string;
  player_id: string;
  team_id: string;
  match_id: string;
  side: string;
  position: string;
  champion: string;
  is_winner: boolean;
  
  // Combat stats
  kills: number;
  deaths: number;
  assists: number;
  double_kills: number;
  triple_kills: number;
  quadra_kills: number;
  penta_kills: number;
  first_blood_kill: boolean;
  first_blood_assist: boolean;
  first_blood_victim: boolean;
  
  // Damage stats
  damage_to_champions: number;
  dpm: number;
  damage_share: number;
  damage_taken_per_minute: number;
  damage_mitigated_per_minute: number;
  
  // Vision stats
  wards_placed: number;
  wpm: number;
  wards_killed: number;
  wcpm: number;
  control_wards_bought: number;
  vision_score: number;
  vspm: number;
  
  // Gold stats
  total_gold: number;
  earned_gold: number;
  earned_gpm: number;
  earned_gold_share: number;
  gold_spent: number;
  gspd: number;
  gpr: number;
  
  // CS stats
  total_cs: number;
  minion_kills: number;
  monster_kills: number;
  monster_kills_own_jungle: number;
  monster_kills_enemy_jungle: number;
  cspm: number;
  
  // Timeline stats: 10 min
  gold_at_10: number;
  xp_at_10: number;
  cs_at_10: number;
  opp_gold_at_10: number;
  opp_xp_at_10: number;
  opp_cs_at_10: number;
  gold_diff_at_10: number;
  xp_diff_at_10: number;
  cs_diff_at_10: number;
  kills_at_10: number;
  assists_at_10: number;
  deaths_at_10: number;
  opp_kills_at_10: number;
  opp_assists_at_10: number;
  opp_deaths_at_10: number;
  
  // Timeline stats: 15 min
  gold_at_15: number;
  xp_at_15: number;
  cs_at_15: number;
  opp_gold_at_15: number;
  opp_xp_at_15: number;
  opp_cs_at_15: number;
  gold_diff_at_15: number;
  xp_diff_at_15: number;
  cs_diff_at_15: number;
  kills_at_15: number;
  assists_at_15: number;
  deaths_at_15: number;
  opp_kills_at_15: number;
  opp_assists_at_15: number;
  opp_deaths_at_15: number;
  
  // Timeline stats: 20 min
  gold_at_20: number;
  xp_at_20: number;
  cs_at_20: number;
  opp_gold_at_20: number;
  opp_xp_at_20: number;
  opp_cs_at_20: number;
  gold_diff_at_20: number;
  xp_diff_at_20: number;
  cs_diff_at_20: number;
  kills_at_20: number;
  assists_at_20: number;
  deaths_at_20: number;
  opp_kills_at_20: number;
  opp_assists_at_20: number;
  opp_deaths_at_20: number;
  
  // Timeline stats: 25 min
  gold_at_25: number;
  xp_at_25: number;
  cs_at_25: number;
  opp_gold_at_25: number;
  opp_xp_at_25: number;
  opp_cs_at_25: number;
  gold_diff_at_25: number;
  xp_diff_at_25: number;
  cs_diff_at_25: number;
  kills_at_25: number;
  assists_at_25: number;
  deaths_at_25: number;
  opp_kills_at_25: number;
  opp_assists_at_25: number;
  opp_deaths_at_25: number;
}

export interface TeamStatsTracker {
  wins: number;
  losses: number;
  blueWins: number;
  blueLosses: number;
  redWins: number;
  redLosses: number;
  gameTimes: number[];
}

export interface PlayerStatsTracker {
  kills: number;
  deaths: number;
  assists: number;
  games: number;
  cs: number;
  totalDamage: number;
  championsPlayed: Set<string>;
}

// Type pour une map de la somme des dégâts par équipe et par partie
export interface TeamGameDamageMap extends Map<string, Map<string, number>> {}

// Type pour une map des pourcentages de dégâts par joueur
export interface PlayerDamageSharesMap extends Map<string, number[]> {}

// Define PicksAndBans interface for champion pick/ban data
export interface PicksAndBans {
  [key: string]: {
    championId: string;
    championName?: string;
    role?: string;
    playerName?: string;
  }[];
}

// Improved helper function to parse boolean values from strings with more robust logic
export function parseBoolean(value: any): boolean | null {
  if (value === undefined || value === null) {
    return null;
  }
  
  // Si c'est déjà un booléen
  if (typeof value === 'boolean') {
    return value;
  }
  
  // Si c'est une chaîne
  if (typeof value === 'string') {
    const normalized = value.toLowerCase().trim();
    if (['true', '1', 'yes', 'oui', 't', 'y'].includes(normalized)) {
      return true;
    }
    if (['false', '0', 'no', 'non', 'f', 'n'].includes(normalized)) {
      return false;
    }
  }
  
  // Si c'est un nombre
  if (typeof value === 'number') {
    return value === 1;
  }
  
  return null;
}

// Helper function to safely parse integers
export function safeParseInt(value: any): number {
  if (value === undefined || value === null || value === '') {
    return 0;
  }
  
  if (typeof value === 'number') {
    return Math.floor(value);
  }
  
  const parsed = parseInt(String(value), 10);
  return isNaN(parsed) ? 0 : parsed;
}

// Helper function to safely parse floats
export function safeParseFloat(value: any): number {
  if (value === undefined || value === null || value === '') {
    return 0;
  }
  
  if (typeof value === 'number') {
    return value;
  }
  
  const parsed = parseFloat(String(value));
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Convert a value to a string representation suitable for database storage
 */
export function booleanToString(value: any): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  
  // Si c'est un booléen, le convertir directement
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  
  // Si c'est déjà une chaîne, la retourner telle quelle
  if (typeof value === 'string') {
    return value;
  }
  
  // Pour d'autres types, convertir en string
  return String(value);
}

/**
 * Convert JSON data to a proper format for database storage
 * Improved to handle both string and object inputs
 */
export function prepareJsonData(data: any): any {
  if (!data) return null;
  
  // Si c'est déjà un objet mais pas une chaîne
  if (typeof data === 'object' && data !== null) {
    return data;
  }
  
  // Si c'est une chaîne, essayer de la parser en JSON
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to parse JSON string:', e);
      // Si ce n'est pas un JSON valide, le retourner tel quel
      return data;
    }
  }
  
  // Pour tout autre type de données
  return data;
}

// Helper function to parse objective values
export function parseObjectiveValue(value: any, teamId: string | null = null): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  
  // Handle boolean values
  if (typeof value === 'boolean') {
    return value ? (teamId || 'true') : '';
  }
  
  // Handle string values
  if (typeof value === 'string') {
    const normalized = value.toLowerCase().trim();
    if (['true', '1', 'yes', 'oui', 't', 'y'].includes(normalized)) {
      return teamId || 'true';
    }
    if (['false', '0', 'no', 'non', 'f', 'n'].includes(normalized)) {
      return '';
    }
    
    // If the value is already a team ID, return it directly
    return value;
  }
  
  // Handle numeric values
  if (typeof value === 'number') {
    return value === 1 ? (teamId || 'true') : '';
  }
  
  return null;
}
