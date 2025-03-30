import { Team, Player, Match, Tournament } from './models/types';

// Types for CSV data
export interface TeamCSV {
  id: string;
  name: string;
  logo: string;
  region: string;
  winRate: string;
  blueWinRate: string;
  redWinRate: string;
  averageGameTime: string;
}

export interface PlayerCSV {
  id: string;
  name: string;
  role: string;
  image: string;
  team: string;
  kda: string;
  csPerMin: string;
  damageShare: string;
  championPool: string;
}

export interface MatchCSV {
  id: string;
  tournament: string;
  date: string;
  teamBlueId: string;
  teamRedId: string;
  predictedWinner: string;
  blueWinOdds: string;
  redWinOdds: string;
  status: string;
  winnerTeamId?: string;
  scoreBlue?: string;
  scoreRed?: string;
  duration?: string;
  mvp?: string;
  firstBlood?: string;
  firstDragon?: string;
  firstBaron?: string;
  patch?: string;
  year?: string;
  split?: string;
  playoffs?: string;
}

// Extended type for League of Legends games data in Oracle's Elixir format
export interface LeagueGameDataRow {
  gameid: string;
  league: string;
  year: string;
  split: string;
  playoffs: string;
  date: string;
  game: string;
  patch: string;
  participantid: string;
  side: string;
  position: string;
  playername: string;
  playerid: string;
  teamname: string;
  teamid: string;
  champion: string;
  ban1: string;
  ban2: string;
  ban3: string;
  ban4: string;
  ban5: string;
  gamelength: string;
  result: string;
  kills: string;
  deaths: string;
  assists: string;
  teamkills: string;
  teamdeaths: string;
  doublekills: string;
  triplekills: string;
  quadrakills: string;
  pentakills: string;
  firstblood: string;
  firstbloodkill: string;
  firstbloodassist: string;
  firstbloodvictim: string;
  team: string;
  'team kpm': string;
  ckpm: string;
  firstdragon: string;
  dragons: string;
  opp_dragons: string;
  elementaldrakes: string;
  opp_elementaldrakes: string;
  infernals: string;
  mountains: string;
  clouds: string;
  oceans: string;
  chemtechs: string;
  hextechs: string;
  'dragons (type unknown)': string;
  elders: string;
  opp_elders: string;
  firstherald: string;
  heralds: string;
  opp_heralds: string;
  firstbaron: string;
  barons: string;
  opp_barons: string;
  void_grubs: string;
  opp_void_grubs: string;
  firsttower: string;
  towers: string;
  opp_towers: string;
  firstmidtower: string;
  firsttothreetowers: string;
  turretplates: string;
  opp_turretplates: string;
  inhibitors: string;
  opp_inhibitors: string;
  damagetochampions: string;
  dpm: string;
  damageshare: string;
  damagetakenperminute: string;
  damagemitigatedperminute: string;
  wardsplaced: string;
  wpm: string;
  wardskilled: string;
  wcpm: string;
  controlwardsbought: string;
  visionscore: string;
  vspm: string;
  totalgold: string;
  earnedgold: string;
  'earned gpm': string;
  earnedgoldshare: string;
  goldspent: string;
  gspd: string;
  gpr: string;
  'total cs': string;
  minionkills: string;
  monsterkills: string;
  monsterkillsownjungle: string;
  monsterkillsenemyjungle: string;
  cspm: string;
  goldat10: string;
  xpat10: string;
  csat10: string;
  opp_goldat10: string;
  opp_xpat10: string;
  opp_csat10: string;
  golddiffat10: string;
  xpdiffat10: string;
  csdiffat10: string;
  killsat10: string;
  assistsat10: string;
  deathsat10: string;
  opp_killsat10: string;
  opp_assistsat10: string;
  opp_deathsat10: string;
  goldat15: string;
  xpat15: string;
  csat15: string;
  opp_goldat15: string;
  opp_xpat15: string;
  opp_csat15: string;
  golddiffat15: string;
  xpdiffat15: string;
  csdiffat15: string;
  killsat15: string;
  assistsat15: string;
  deathsat15: string;
  opp_killsat15: string;
  opp_assistsat15: string;
  opp_deathsat15: string;
  goldat20: string;
  xpat20: string;
  csat20: string;
  opp_goldat20: string;
  opp_xpat20: string;
  opp_csat20: string;
  golddiffat20: string;
  xpdiffat20: string;
  csdiffat20: string;
  killsat20: string;
  assistsat20: string;
  deathsat20: string;
  opp_killsat20: string;
  opp_assistsat20: string;
  opp_deathsat20: string;
  goldat25: string;
  xpat25: string;
  csat25: string;
  opp_goldat25: string;
  opp_xpat25: string;
  opp_csat25: string;
  golddiffat25: string;
  xpdiffat25: string;
  csdiffat25: string;
  killsat25: string;
  assistsat25: string;
  deathsat25: string;
  opp_killsat25: string;
  opp_assistsat25: string;
  opp_deathsat25: string;
}

// Create a module-level cache with getter and setter functions
let _loadedTeams: Team[] | null = null;
let _loadedPlayers: Player[] | null = null;
let _loadedMatches: Match[] | null = null;
let _loadedTournaments: Tournament[] | null = null;

// Getter functions
export const getLoadedTeams = (): Team[] | null => _loadedTeams;
export const getLoadedPlayers = (): Player[] | null => _loadedPlayers;
export const getLoadedMatches = (): Match[] | null => _loadedMatches;
export const getLoadedTournaments = (): Tournament[] | null => _loadedTournaments;

// Setter functions
export const setLoadedTeams = (teams: Team[] | null): void => {
  _loadedTeams = teams;
};

export const setLoadedPlayers = (players: Player[] | null): void => {
  _loadedPlayers = players;
};

export const setLoadedMatches = (matches: Match[] | null): void => {
  _loadedMatches = matches;
};

export const setLoadedTournaments = (tournaments: Tournament[] | null): void => {
  _loadedTournaments = tournaments;
};

// Function to reset the cache
export const resetCache = (): void => {
  _loadedTeams = null;
  _loadedPlayers = null;
  _loadedMatches = null;
  _loadedTournaments = null;
};
