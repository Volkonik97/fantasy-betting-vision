
import { MatchTeamStats } from '../types';
import { LeagueGameDataRow } from '../../csv/types';
import { safeParseFloat, safeParseInt } from '../types';

/**
 * Extract team statistics from game rows
 */
export function extractTeamStats(
  gameId: string, 
  gameRows: LeagueGameDataRow[]
): Map<string, MatchTeamStats> {
  const teamStatsMap = new Map<string, MatchTeamStats>();
  
  // Process rows by team to avoid duplicate processing
  const teamRows = new Map<string, LeagueGameDataRow[]>();
  
  // Group rows by team ID
  gameRows.forEach(row => {
    if (!row.teamid) return;
    
    if (!teamRows.has(row.teamid)) {
      teamRows.set(row.teamid, []);
    }
    
    teamRows.get(row.teamid)?.push(row);
  });
  
  // Process each team's data
  teamRows.forEach((rows, teamId) => {
    if (teamStatsMap.has(teamId)) return; // Skip if already processed
    
    // Use the first row as base data for this team
    const baseRow = rows[0];
    if (!baseRow) return;
    
    console.log(`Extraction des statistiques d'équipe pour ${teamId} dans le match ${gameId}`);
    
    // Collect all rows for this game and team
    const allTeamRows = gameRows.filter(row => row.teamid === teamId);
    const allTeamData = combineTeamRowData(allTeamRows);
    
    // Log all collected data keys for debugging
    const dataKeys = Object.keys(allTeamData);
    console.log(`Données disponibles pour l'équipe ${teamId}:`, dataKeys);
    
    // Determine if this team got first objectives by checking all collected data
    const hasFirstBlood = getFirstObjectiveValue(allTeamData, 'firstblood', teamId);
    const hasFirstDragon = getFirstObjectiveValue(allTeamData, 'firstdragon', teamId);
    const hasFirstHerald = getFirstObjectiveValue(allTeamData, 'firstherald', teamId);
    const hasFirstBaron = getFirstObjectiveValue(allTeamData, 'firstbaron', teamId);
    const hasFirstTower = getFirstObjectiveValue(allTeamData, 'firsttower', teamId);
    const hasFirstMidTower = getFirstObjectiveValue(allTeamData, 'firstmidtower', teamId);
    const hasFirstThreeTowers = getFirstObjectiveValue(allTeamData, 'firsttothreetowers', teamId);
    
    // Parse numeric values from all collected data
    const dragons = getStatValue(allTeamData, 'dragons');
    const oppDragons = getStatValue(allTeamData, 'opp_dragons');
    const elementalDrakes = getStatValue(allTeamData, 'elementaldrakes');
    const oppElementalDrakes = getStatValue(allTeamData, 'opp_elementaldrakes');
    const infernals = getStatValue(allTeamData, 'infernals');
    const mountains = getStatValue(allTeamData, 'mountains');
    const clouds = getStatValue(allTeamData, 'clouds');
    const oceans = getStatValue(allTeamData, 'oceans');
    const chemtechs = getStatValue(allTeamData, 'chemtechs');
    const hextechs = getStatValue(allTeamData, 'hextechs');
    const drakesUnknown = getStatValue(allTeamData, 'dragons (type unknown)');
    const elders = getStatValue(allTeamData, 'elders');
    const oppElders = getStatValue(allTeamData, 'opp_elders');
    const heralds = getStatValue(allTeamData, 'heralds');
    const oppHeralds = getStatValue(allTeamData, 'opp_heralds');
    const voidGrubs = getStatValue(allTeamData, 'void_grubs'); 
    const oppVoidGrubs = getStatValue(allTeamData, 'opp_void_grubs');
    const barons = getStatValue(allTeamData, 'barons');
    const oppBarons = getStatValue(allTeamData, 'opp_barons');
    const towers = getStatValue(allTeamData, 'towers');
    const oppTowers = getStatValue(allTeamData, 'opp_towers');
    const turretPlates = getStatValue(allTeamData, 'turretplates');
    const oppTurretPlates = getStatValue(allTeamData, 'opp_turretplates');
    const inhibitors = getStatValue(allTeamData, 'inhibitors');
    const oppInhibitors = getStatValue(allTeamData, 'opp_inhibitors');
    const teamKills = getStatValue(allTeamData, 'teamkills');
    const teamDeaths = getStatValue(allTeamData, 'teamdeaths');
    const teamKpm = getStatValue(allTeamData, 'team kpm'); 
    const ckpm = getStatValue(allTeamData, 'ckpm');
    
    teamStatsMap.set(teamId, {
      team_id: teamId,
      match_id: gameId,
      side: baseRow.side || '',
      is_winner: baseRow.result === '1',
      team_kpm: teamKpm,
      ckpm: ckpm,
      first_blood: hasFirstBlood,
      team_kills: teamKills,
      team_deaths: teamDeaths,
      first_dragon: hasFirstDragon,
      dragons: dragons,
      opp_dragons: oppDragons,
      elemental_drakes: elementalDrakes,
      opp_elemental_drakes: oppElementalDrakes,
      infernals: infernals,
      mountains: mountains,
      clouds: clouds,
      oceans: oceans,
      chemtechs: chemtechs,
      hextechs: hextechs,
      drakes_unknown: drakesUnknown,
      elders: elders,
      opp_elders: oppElders,
      first_herald: hasFirstHerald,
      heralds: heralds,
      opp_heralds: oppHeralds,
      first_baron: hasFirstBaron,
      barons: barons,
      opp_barons: oppBarons,
      void_grubs: voidGrubs,
      opp_void_grubs: oppVoidGrubs,
      first_tower: hasFirstTower,
      first_mid_tower: hasFirstMidTower,
      first_three_towers: hasFirstThreeTowers,
      towers: towers,
      opp_towers: oppTowers,
      turret_plates: turretPlates,
      opp_turret_plates: oppTurretPlates,
      inhibitors: inhibitors,
      opp_inhibitors: oppInhibitors
    });
    
    console.log(`Statistiques extraites pour l'équipe ${teamId}:`, {
      dragons: dragons,
      barons: barons,
      firstBlood: hasFirstBlood,
      firstDragon: hasFirstDragon
    });
  });
  
  return teamStatsMap;
}

/**
 * Combine all data from multiple rows for the same team
 * to ensure we capture all available statistics
 */
function combineTeamRowData(rows: LeagueGameDataRow[]): Record<string, any> {
  const combinedData: Record<string, any> = {};
  
  rows.forEach(row => {
    // Iterate through all properties in the row
    Object.entries(row).forEach(([key, value]) => {
      // Only set the value if it's not empty and not already set
      if (value !== undefined && value !== null && value !== '' && 
          (combinedData[key] === undefined || combinedData[key] === null || combinedData[key] === '')) {
        combinedData[key] = value;
      }
    });
  });
  
  return combinedData;
}

/**
 * Get the value for a first objective (firstblood, firstdragon, etc.)
 * from the combined team data
 */
function getFirstObjectiveValue(data: Record<string, any>, objectiveKey: string, teamId: string): string | null {
  if (!data[objectiveKey]) return null;
  
  return checkTeamObjectiveValue(data[objectiveKey], teamId);
}

/**
 * Get a numeric stat value from the combined team data
 * Returns a numeric value or 0 if not found or not numeric
 */
function getStatValue(data: Record<string, any>, statKey: string): number {
  const value = data[statKey];
  
  if (value === undefined || value === null || value === '') {
    return 0;
  }
  
  // Try to parse as float first, then as int if that fails
  const parsed = safeParseFloat(value);
  return isNaN(parsed) ? safeParseInt(value) : parsed;
}

/**
 * Helper function to check if a team got an objective
 * This handles various formats in the data: team ID, boolean, or team name
 */
function checkTeamObjectiveValue(value: string | undefined, teamId: string): string | null {
  if (!value) return null;
  
  // Si la valeur est exactement le teamId, c'est cette équipe qui a eu l'objectif
  if (value === teamId) return teamId;
  
  // Si c'est "1" ou "true", on considère que c'est cette équipe
  if (value === '1' || value.toLowerCase() === 'true') return teamId;
  
  // Si c'est "0" ou "false", ce n'est pas cette équipe
  if (value === '0' || value.toLowerCase() === 'false') return null;
  
  // Sinon, on retourne la valeur telle quelle (pourrait être un nom d'équipe)
  return value;
}
