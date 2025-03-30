
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
    
    // Log available data keys to help with debugging
    const dataKeys = Object.keys(allTeamData).filter(key => allTeamData[key] !== undefined && allTeamData[key] !== null && allTeamData[key] !== '');
    console.log(`Données disponibles pour l'équipe ${teamId}:`, dataKeys.length > 0 ? dataKeys.join(', ') : 'aucune');
    
    // Determine if this team got first objectives by checking all collected data
    const hasFirstBlood = getFirstObjectiveValue(allTeamData, 'firstblood', teamId);
    const hasFirstDragon = getFirstObjectiveValue(allTeamData, 'firstdragon', teamId);
    const hasFirstHerald = getFirstObjectiveValue(allTeamData, 'firstherald', teamId);
    const hasFirstBaron = getFirstObjectiveValue(allTeamData, 'firstbaron', teamId);
    const hasFirstTower = getFirstObjectiveValue(allTeamData, 'firsttower', teamId);
    const hasFirstMidTower = getFirstObjectiveValue(allTeamData, 'firstmidtower', teamId);
    const hasFirstThreeTowers = getFirstObjectiveValue(allTeamData, 'firsttothreetowers', teamId);
    
    // Parse numeric values with explicit type handling
    const dragons = getStatValue(allTeamData, 'dragons');
    const oppDragons = getStatValue(allTeamData, 'opp_dragons');
    const elementalDrakes = getStatValue(allTeamData, 'elementaldrakes');
    const oppElementalDrakes = getStatValue(allTeamData, 'opp_elementaldrakes');
    
    // Parse specific drake types using safe parsing and handle special cases
    const infernals = getStatValue(allTeamData, 'infernals');
    const mountains = getStatValue(allTeamData, 'mountains');
    const clouds = getStatValue(allTeamData, 'clouds');
    const oceans = getStatValue(allTeamData, 'oceans');
    const chemtechs = getStatValue(allTeamData, 'chemtechs');
    const hextechs = getStatValue(allTeamData, 'hextechs');
    const drakesUnknown = getStatValue(allTeamData, 'dragons (type unknown)');
    
    // Parse opponent drake types specifically
    const oppInfernals = getStatValue(allTeamData, 'opp_infernals');
    const oppMountains = getStatValue(allTeamData, 'opp_mountains');
    const oppClouds = getStatValue(allTeamData, 'opp_clouds');
    const oppOceans = getStatValue(allTeamData, 'opp_oceans');
    const oppChemtechs = getStatValue(allTeamData, 'opp_chemtechs');
    const oppHextechs = getStatValue(allTeamData, 'opp_hextechs');
    const oppDrakesUnknown = getStatValue(allTeamData, 'opp_drakes_unknown');
    
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
    
    // Log detailed drake information for debugging
    if (['LOLTMNT02_215152', 'LOLTMNT02_222859'].includes(gameId)) {
      console.log(`Match ${gameId}, Team ${teamId} detailed drake stats:`, {
        total: dragons,
        specific: {
          infernals,
          mountains,
          clouds,
          oceans,
          chemtechs,
          hextechs,
          unknown: drakesUnknown
        },
        opponent: {
          total: oppDragons,
          specific: {
            infernals: oppInfernals,
            mountains: oppMountains,
            clouds: oppClouds,
            oceans: oppOceans,
            chemtechs: oppChemtechs,
            hextechs: oppHextechs,
            unknown: oppDrakesUnknown
          }
        },
        raw: {
          infernals: allTeamData.infernals,
          mountains: allTeamData.mountains,
          clouds: allTeamData.clouds,
          oceans: allTeamData.oceans,
          chemtechs: allTeamData.chemtechs,
          hextechs: allTeamData.hextechs,
          opp_infernals: allTeamData.opp_infernals,
          opp_mountains: allTeamData.opp_mountains,
          opp_clouds: allTeamData.opp_clouds,
          opp_oceans: allTeamData.opp_oceans,
          opp_chemtechs: allTeamData.opp_chemtechs,
          opp_hextechs: allTeamData.opp_hextechs
        }
      });
    }
    
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
    // Convert keys to lowercase for case-insensitive comparisons
    const processedRow: Record<string, any> = {};
    
    Object.entries(row).forEach(([key, value]) => {
      // Store both original key and lowercase version to preserve case when needed
      processedRow[key] = value;
      if (key.toLowerCase() !== key) {
        processedRow[key.toLowerCase()] = value;
      }
    });
    
    // Iterate through all properties in the processed row
    Object.entries(processedRow).forEach(([key, value]) => {
      // Only set the value if it's not empty and not already set
      if (value !== undefined && value !== null && value !== '') {
        const lowerKey = key.toLowerCase();
        
        // If the key doesn't exist yet or is empty, always set it
        if (combinedData[key] === undefined || combinedData[key] === null || combinedData[key] === '') {
          combinedData[key] = value;
        }
        // For specific keys like drake counts, always take the highest value
        else if (lowerKey.includes('dragon') || lowerKey.includes('drake') || 
                lowerKey.includes('cloud') || lowerKey.includes('infernal') || 
                lowerKey.includes('mountain') || lowerKey.includes('ocean') || 
                lowerKey.includes('chemtech') || lowerKey.includes('hextech')) {
          const newVal = safeParseInt(value);
          const oldVal = safeParseInt(combinedData[key]);
          if (newVal > oldVal) {
            combinedData[key] = value;
          }
        }
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
  // Try both the key as provided and lowercase version
  const value = data[objectiveKey] || data[objectiveKey.toLowerCase()];
  if (!value) return null;
  
  return checkTeamObjectiveValue(value, teamId);
}

/**
 * Get a numeric stat value from the combined team data
 * Returns a numeric value or 0 if not found or not numeric
 */
function getStatValue(data: Record<string, any>, statKey: string): number {
  // Try both the key as provided and lowercase version
  const value = data[statKey] || data[statKey.toLowerCase()];
  
  if (value === undefined || value === null || value === '') {
    return 0;
  }
  
  // Handle various string formats
  if (typeof value === 'string') {
    // If it's "1" or "true", convert to 1
    if (value.toLowerCase() === 'true' || value === '1' || value === 'yes') {
      return 1;
    }
    // If it's "0" or "false", convert to 0
    if (value.toLowerCase() === 'false' || value === '0' || value === 'no') {
      return 0;
    }
  }
  
  // Try to parse as float first, then as int if that fails
  const parsed = safeParseFloat(value);
  const result = isNaN(parsed) ? safeParseInt(value) : parsed;
  
  // Extra debug logging for specific drake fields
  if (statKey.includes('cloud') || statKey.includes('infernal') || 
      statKey.includes('mountain') || statKey.includes('ocean') ||
      statKey.includes('chemtech') || statKey.includes('hextech')) {
    console.log(`Parsing ${statKey}: value "${value}" (type: ${typeof value}) --> parsed as ${result}`);
  }
  
  return result;
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
  if (value === '1' || value.toLowerCase() === 'true' || value.toLowerCase() === 'yes') return teamId;
  
  // Si c'est "0" ou "false", ce n'est pas cette équipe
  if (value === '0' || value.toLowerCase() === 'false' || value.toLowerCase() === 'no') return null;
  
  // Sinon, on retourne la valeur telle quelle (pourrait être un nom d'équipe)
  return value;
}
