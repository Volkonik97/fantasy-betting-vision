
import { GameTracker, MatchTeamStats } from '../types';
import { LeagueGameDataRow } from '../../csv/types';
import { Match } from '../../models/types';
import { extractPicksAndBans } from '../match/picksAndBansExtractor';
import { extractTeamSpecificStats } from '../../database/matches/teamStatsExtractor';

/**
 * Process match data and extract match object
 */
export function processMatchObject(
  match: any, 
  teams: any[], 
  matchStats: Map<string, Map<string, any>>,
  gameRows: LeagueGameDataRow[]
): Match | null {
  // Check if required teams exist
  const { blueTeam, redTeam } = findMatchTeams(match, teams);
  
  if (!blueTeam || !redTeam) {
    console.warn(`Match ${match.id} is missing a team: blue=${match.teamBlueId}, red=${match.teamRedId}`);
    // Skip this match if teams are missing
    return null;
  }
  
  // Extract picks and bans data
  const { picksData, bansData } = extractPicksAndBansData(match, gameRows);
  
  // Process team rows data
  const { blueTeamRows, redTeamRows } = extractTeamRows(gameRows);
  
  // Log warnings if team rows are missing
  logTeamRowsWarnings(match.id, blueTeamRows, redTeamRows);
  
  // Create match object with base data
  const matchObject = createBaseMatchObject(match, blueTeam, redTeam, picksData, bansData);
  
  // Process team statistics
  processTeamStats(match.id, matchObject, matchStats, blueTeam, redTeam);
  
  // Add match result if completed
  if (match.status === 'Completed' && match.winnerTeamId) {
    addMatchResult(matchObject, match);
  }
  
  return matchObject;
}

/**
 * Find blue and red teams for a match
 */
function findMatchTeams(match: any, teams: any[]): { blueTeam: any; redTeam: any } {
  const blueTeam = teams.find(t => t.id === match.teamBlueId);
  const redTeam = teams.find(t => t.id === match.teamRedId);
  
  return { blueTeam, redTeam };
}

/**
 * Extract picks and bans data from match or game rows
 */
function extractPicksAndBansData(match: any, gameRows: LeagueGameDataRow[]): { 
  picksData: any; 
  bansData: any; 
} {
  // Check if we have picks and bans data direct in the match object
  let picksData = match.picks;
  let bansData = match.bans;
  
  // If not in the match object, try to extract from game rows
  if ((!picksData || !bansData) && gameRows && gameRows.length > 0) {
    console.log(`[matchProcessor] Match ${match.id} - Extracting picks and bans from ${gameRows.length} game rows`);
    
    // Check if we have pick/ban columns in the data
    const hasBanColumns = gameRows.some(row => 
      row.ban1 || row.ban2 || row.ban3 || row.ban4 || row.ban5
    );
    
    const hasPickColumns = gameRows.some(row => 
      row.pick1 || row.pick2 || row.pick3 || row.pick4 || row.pick5
    );
    
    console.log(`[matchProcessor] Match ${match.id} - Has ban columns: ${hasBanColumns}, has pick columns: ${hasPickColumns}`);
    
    // Extract picks and bans from game data rows
    const { picks, bans } = extractPicksAndBans(gameRows);
    
    // Only override if we found data
    if (picks && Object.keys(picks).length > 0) {
      picksData = picks;
      console.log(`[matchProcessor] Match ${match.id} - Found ${Object.keys(picks).length} picks from rows`);
    }
    
    if (bans && Object.keys(bans).length > 0) {
      bansData = bans;
      console.log(`[matchProcessor] Match ${match.id} - Found ${Object.keys(bans).length} bans from rows`);
    }
  }
  
  return { picksData, bansData };
}

/**
 * Extract team rows based on team position
 */
function extractTeamRows(gameRows: LeagueGameDataRow[]): {
  blueTeamRows: LeagueGameDataRow[];
  redTeamRows: LeagueGameDataRow[];
} {
  // Identify blue and red team rows
  const blueTeamRows = gameRows.filter(row => 
    row.side?.toLowerCase() === 'blue' || 
    row.teamposition?.toLowerCase() === 'blue'
  );
  
  const redTeamRows = gameRows.filter(row => 
    row.side?.toLowerCase() === 'red' || 
    row.teamposition?.toLowerCase() === 'red'
  );
  
  return { blueTeamRows, redTeamRows };
}

/**
 * Log warnings if team rows are missing
 */
function logTeamRowsWarnings(matchId: string, blueTeamRows: LeagueGameDataRow[], redTeamRows: LeagueGameDataRow[]): void {
  if (blueTeamRows.length === 0) {
    console.warn(`Match ${matchId}: No blue team rows found`);
  }
  
  if (redTeamRows.length === 0) {
    console.warn(`Match ${matchId}: No red team rows found`);
  }
}

/**
 * Create base match object with common data
 */
function createBaseMatchObject(
  match: any,
  blueTeam: any,
  redTeam: any,
  picksData: any,
  bansData: any
): Match {
  return {
    id: match.id,
    tournament: match.tournament,
    date: match.date,
    teamBlue: blueTeam,
    teamRed: redTeam,
    predictedWinner: match.predictedWinner,
    blueWinOdds: parseFloat(match.blueWinOdds) || 0.5,
    redWinOdds: parseFloat(match.redWinOdds) || 0.5,
    status: match.status as 'Upcoming' | 'Live' | 'Completed',
    // Always initialize extraStats, even if no team stats available
    extraStats: createExtraStatsObject(match, picksData, bansData)
  };
}

/**
 * Create the extra stats object with objective data
 */
function createExtraStatsObject(match: any, picksData: any, bansData: any) {
  return {
    patch: match.patch || '',
    year: match.year || '',
    split: match.split || '',
    playoffs: match.playoffs === 'true',
    team_kpm: parseFloat(match.teamKpm || '0') || 0,
    ckpm: parseFloat(match.ckpm || '0') || 0,
    first_blood: match.firstBlood || null,
    first_dragon: match.firstDragon || null,
    first_herald: match.firstHerald || null,
    first_baron: match.firstBaron || null,
    first_tower: match.firstTower || null,
    first_mid_tower: match.firstMidTower || null,
    first_three_towers: match.firstThreeTowers || null,
    
    // Initialize objective stats with zeros to ensure they're always present
    dragons: parseInt(match.dragons || '0') || 0,
    opp_dragons: parseInt(match.oppDragons || '0') || 0,
    elemental_drakes: parseInt(match.elementalDrakes || '0') || 0,
    opp_elemental_drakes: parseInt(match.oppElementalDrakes || '0') || 0,
    infernals: parseInt(match.infernals || '0') || 0,
    mountains: parseInt(match.mountains || '0') || 0,
    clouds: parseInt(match.clouds || '0') || 0,
    oceans: parseInt(match.oceans || '0') || 0,
    chemtechs: parseInt(match.chemtechs || '0') || 0,
    hextechs: parseInt(match.hextechs || '0') || 0,
    drakes_unknown: parseInt(match.drakesUnknown || '0') || 0,
    elders: parseInt(match.elders || '0') || 0,
    opp_elders: parseInt(match.oppElders || '0') || 0,
    heralds: parseInt(match.heralds || '0') || 0,
    opp_heralds: parseInt(match.oppHeralds || '0') || 0,
    barons: parseInt(match.barons || '0') || 0,
    opp_barons: parseInt(match.oppBarons || '0') || 0,
    void_grubs: parseInt(match.voidGrubs || '0') || 0,
    opp_void_grubs: parseInt(match.oppVoidGrubs || '0') || 0,
    towers: parseInt(match.towers || '0') || 0,
    opp_towers: parseInt(match.oppTowers || '0') || 0,
    turret_plates: parseInt(match.turretPlates || '0') || 0,
    opp_turret_plates: parseInt(match.oppTurretPlates || '0') || 0,
    inhibitors: parseInt(match.inhibitors || '0') || 0,
    opp_inhibitors: parseInt(match.oppInhibitors || '0') || 0,
    team_kills: parseInt(match.teamKills || '0') || 0,
    team_deaths: parseInt(match.teamDeaths || '0') || 0,
    
    // Include picks and bans - use the data we determined above
    picks: picksData || null,
    bans: bansData || null
  };
}

/**
 * Process team statistics
 */
function processTeamStats(
  matchId: string, 
  matchObject: Match, 
  matchStats: Map<string, Map<string, any>>,
  blueTeam: any,
  redTeam: any
): void {
  // Find team stats for this match
  const teamStatsMap = matchStats.get(matchId);
  
  // Process blue team stats
  const blueTeamStats = teamStatsMap?.get(blueTeam.id);
  if (blueTeamStats) {
    logTeamStats(matchId, 'Blue', blueTeamStats);
    matchObject.extraStats!.blueTeamStats = blueTeamStats;
  }
  
  // Process red team stats
  const redTeamStats = teamStatsMap?.get(redTeam.id);
  if (redTeamStats) {
    logTeamStats(matchId, 'Red', redTeamStats);
    matchObject.extraStats!.redTeamStats = redTeamStats;
  }
}

/**
 * Log team statistics for debugging
 */
function logTeamStats(matchId: string, side: string, teamStats: any): void {
  console.log(`[matchProcessor] Match ${matchId} - ${side} team stats extracted:`, {
    dragons: teamStats.dragons,
    elemental_drakes: teamStats.elemental_drakes,
    infernals: teamStats.infernals,
    mountains: teamStats.mountains,
    clouds: teamStats.clouds,
    oceans: teamStats.oceans,
    chemtechs: teamStats.chemtechs,
    hextechs: teamStats.hextechs,
    drakes_unknown: teamStats.drakes_unknown,
    heralds: teamStats.heralds,
    barons: teamStats.barons,
    towers: teamStats.towers,
    turret_plates: teamStats.turret_plates,
    inhibitors: teamStats.inhibitors,
    void_grubs: teamStats.void_grubs
  });
}

/**
 * Add result data to a completed match
 */
function addMatchResult(matchObject: Match, match: any): void {
  matchObject.result = {
    winner: match.winnerTeamId,
    score: [parseInt(match.scoreBlue || '0'), parseInt(match.scoreRed || '0')],
    duration: match.duration,
    mvp: match.mvp,
    firstBlood: match.firstBlood, 
    firstDragon: match.firstDragon,
    firstBaron: match.firstBaron,
    firstHerald: match.firstHerald,
    firstTower: match.firstTower
  };
}
