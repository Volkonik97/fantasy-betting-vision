
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

  // Timeline stats
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

// Helper function to parse boolean values from strings
export function parseBoolean(value?: string | null): boolean {
  if (!value) return false;
  
  value = value.toLowerCase().trim();
  return value === 'true' || value === '1' || value === 'yes' || value === 'y';
}

// Helper function to safely parse integers
export function safeParseInt(value?: string | null): number {
  if (!value) return 0;
  const parsedValue = parseInt(value, 10);
  return isNaN(parsedValue) ? 0 : parsedValue;
}

// Helper function to safely parse floats
export function safeParseFloat(value?: string | null): number {
  if (!value) return 0;
  const parsedValue = parseFloat(value);
  return isNaN(parsedValue) ? 0 : parsedValue;
}
