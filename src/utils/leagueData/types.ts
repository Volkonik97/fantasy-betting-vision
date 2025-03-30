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
  is_winner: boolean;
  team_kpm: number;
  ckpm: number;
  first_blood: string | null;
  team_kills: number;
  team_deaths: number;
  first_dragon: string | null;
  dragons: number;
  opp_dragons: number;
  elemental_drakes: number;
  opp_elemental_drakes: number;
  infernals: number;
  mountains: number;
  clouds: number;
  oceans: number;
  chemtechs: number;
  hextechs: number;
  drakes_unknown: number;
  elders: number;
  opp_elders: number;
  first_herald: string | null;
  heralds: number;
  opp_heralds: number;
  first_baron: string | null;
  barons: number;
  opp_barons: number;
  void_grubs: number;
  opp_void_grubs: number;
  first_tower: string | null;
  first_mid_tower: string | null;
  first_three_towers: string | null;
  towers: number;
  opp_towers: number;
  turret_plates: number;
  opp_turret_plates: number;
  inhibitors: number;
  opp_inhibitors: number;
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

// Helper function to parse boolean values from strings
export function parseBoolean(value?: string | null): boolean {
  if (!value) return false;
  
  value = value.toLowerCase().trim();
  return value === 'true' || value === '1' || value === 'yes' || value === 'y';
}

// Helper function to safely parse integers
export function safeParseInt(value?: string | null): number {
  if (!value) return 0;
  const parsedValue = parseInt(String(value), 10);
  return isNaN(parsedValue) ? 0 : parsedValue;
}

// Helper function to safely parse floats
export function safeParseFloat(value?: string | null): number {
  if (!value) return 0;
  const parsedValue = parseFloat(String(value));
  return isNaN(parsedValue) ? 0 : parsedValue;
}
