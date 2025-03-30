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
  
  // Get direct dragon values (not case-sensitive)
  const getDragonValue = (data: Record<string, any>, drakeType: string, isOpp: boolean = false): number => {
    const prefix = isOpp ? 'opp_' : '';
    const fullKey = `${prefix}${drakeType}`;
    
    // Try specific variations of the key with and without prefix
    const possibleKeys = [
      fullKey,
      fullKey.toLowerCase(),
      `${prefix}${drakeType.toLowerCase()}`,
      drakeType,
      drakeType.toLowerCase()
    ];
    
    // Find the first key that exists in the data
    for (const key of possibleKeys) {
      if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
        const value = parseInt(data[key]);
        return isNaN(value) ? 0 : value;
      }
    }
    
    return 0;
  };
  
  // Process each team's data
  teamRows.forEach((rows, teamId) => {
    if (teamStatsMap.has(teamId)) return; // Skip if already processed
    
    // Use the first row as base data for this team
    const baseRow = rows[0];
    if (!baseRow) return;
    
    // Collect all rows for this game and team
    const allTeamRows = gameRows.filter(row => row.teamid === teamId);
    const allTeamData = combineTeamRowData(allTeamRows);
    
    // Determine if this team got first objectives by checking all collected data
    const hasFirstBlood = getFirstObjectiveValue(allTeamData, 'firstblood', teamId);
    const hasFirstDragon = getFirstObjectiveValue(allTeamData, 'firstdragon', teamId);
    const hasFirstHerald = getFirstObjectiveValue(allTeamData, 'firstherald', teamId);
    const hasFirstBaron = getFirstObjectiveValue(allTeamData, 'firstbaron', teamId);
    const hasFirstTower = getFirstObjectiveValue(allTeamData, 'firsttower', teamId);
    const hasFirstMidTower = getFirstObjectiveValue(allTeamData, 'firstmidtower', teamId);
    const hasFirstThreeTowers = getFirstObjectiveValue(allTeamData, 'firsttothreetowers', teamId);
    
    // Determine side (blue or red)
    const isBlueTeam = (baseRow.side?.toLowerCase() === 'blue');
    
    // Prepare empty dragon stats object
    const dragonStats = {
      total: 0,
      infernals: 0,
      mountains: 0,
      clouds: 0,
      oceans: 0,
      chemtechs: 0,
      hextechs: 0,
      unknown: 0
    };
    
    const oppDragonStats = {
      total: 0,
      infernals: 0,
      mountains: 0,
      clouds: 0,
      oceans: 0,
      chemtechs: 0,
      hextechs: 0,
      unknown: 0
    };
    
    // Extract direct dragon values based on team side
    if (isBlueTeam) {
      // Blue team uses direct dragon values
      dragonStats.total = getDragonValue(allTeamData, 'dragons');
      dragonStats.infernals = getDragonValue(allTeamData, 'infernals');
      dragonStats.mountains = getDragonValue(allTeamData, 'mountains');
      dragonStats.clouds = getDragonValue(allTeamData, 'clouds');
      dragonStats.oceans = getDragonValue(allTeamData, 'oceans');
      dragonStats.chemtechs = getDragonValue(allTeamData, 'chemtechs');
      dragonStats.hextechs = getDragonValue(allTeamData, 'hextechs');
      dragonStats.unknown = getDragonValue(allTeamData, 'drakes_unknown') || getDragonValue(allTeamData, 'dragons (type unknown)');

      // Opponent (red team) uses opp_ values
      oppDragonStats.total = getDragonValue(allTeamData, 'dragons', true);
      oppDragonStats.infernals = getDragonValue(allTeamData, 'infernals', true);
      oppDragonStats.mountains = getDragonValue(allTeamData, 'mountains', true);
      oppDragonStats.clouds = getDragonValue(allTeamData, 'clouds', true);
      oppDragonStats.oceans = getDragonValue(allTeamData, 'oceans', true);
      oppDragonStats.chemtechs = getDragonValue(allTeamData, 'chemtechs', true);
      oppDragonStats.hextechs = getDragonValue(allTeamData, 'hextechs', true);
      oppDragonStats.unknown = getDragonValue(allTeamData, 'drakes_unknown', true) || getDragonValue(allTeamData, 'dragons (type unknown)', true);
    } else {
      // Red team uses opp_ values
      dragonStats.total = getDragonValue(allTeamData, 'dragons', true);
      dragonStats.infernals = getDragonValue(allTeamData, 'infernals', true);
      dragonStats.mountains = getDragonValue(allTeamData, 'mountains', true);
      dragonStats.clouds = getDragonValue(allTeamData, 'clouds', true);
      dragonStats.oceans = getDragonValue(allTeamData, 'oceans', true);
      dragonStats.chemtechs = getDragonValue(allTeamData, 'chemtechs', true);
      dragonStats.hextechs = getDragonValue(allTeamData, 'hextechs', true);
      dragonStats.unknown = getDragonValue(allTeamData, 'drakes_unknown', true) || getDragonValue(allTeamData, 'dragons (type unknown)', true);

      // Opponent (blue team) uses direct values
      oppDragonStats.total = getDragonValue(allTeamData, 'dragons');
      oppDragonStats.infernals = getDragonValue(allTeamData, 'infernals');
      oppDragonStats.mountains = getDragonValue(allTeamData, 'mountains');
      oppDragonStats.clouds = getDragonValue(allTeamData, 'clouds');
      oppDragonStats.oceans = getDragonValue(allTeamData, 'oceans');
      oppDragonStats.chemtechs = getDragonValue(allTeamData, 'chemtechs');
      oppDragonStats.hextechs = getDragonValue(allTeamData, 'hextechs');
      oppDragonStats.unknown = getDragonValue(allTeamData, 'drakes_unknown') || getDragonValue(allTeamData, 'dragons (type unknown)');
    }
    
    // Log detailed drake information for debugging
    if (['LOLTMNT02_215152', 'LOLTMNT02_222859'].includes(gameId)) {
      console.log(`[Extraction] Match ${gameId}, Team ${teamId} (${baseRow.side}) - extracted dragon data:`, {
        isBlueTeam,
        dragonStats,
        oppDragonStats,
        rawData: {
          dragonsKeys: Object.keys(allTeamData)
            .filter(k => k.includes('dragon') || k.includes('drake') || 
                        k.includes('infernal') || k.includes('mountain') || 
                        k.includes('cloud') || k.includes('ocean') || 
                        k.includes('chemtech') || k.includes('hextech'))
            .reduce((obj, key) => ({...obj, [key]: allTeamData[key]}), {})
        }
      });
    }
    
    // Get other stats
    const elementalDrakes = getDragonValue(allTeamData, 'elementaldrakes', !isBlueTeam);
    const oppElementalDrakes = getDragonValue(allTeamData, 'elementaldrakes', isBlueTeam);
    
    const elders = getDragonValue(allTeamData, 'elders', !isBlueTeam);
    const oppElders = getDragonValue(allTeamData, 'elders', isBlueTeam);
    const heralds = getDragonValue(allTeamData, 'heralds', !isBlueTeam);
    const oppHeralds = getDragonValue(allTeamData, 'heralds', isBlueTeam);
    const barons = getDragonValue(allTeamData, 'barons', !isBlueTeam);
    const oppBarons = getDragonValue(allTeamData, 'barons', isBlueTeam);
    const towers = getDragonValue(allTeamData, 'towers', !isBlueTeam);
    const oppTowers = getDragonValue(allTeamData, 'towers', isBlueTeam);
    const turretPlates = getDragonValue(allTeamData, 'turretplates', !isBlueTeam);
    const oppTurretPlates = getDragonValue(allTeamData, 'turretplates', isBlueTeam);
    const inhibitors = getDragonValue(allTeamData, 'inhibitors', !isBlueTeam);
    const oppInhibitors = getDragonValue(allTeamData, 'inhibitors', isBlueTeam);
    const voidGrubs = getDragonValue(allTeamData, 'void_grubs', !isBlueTeam);
    const oppVoidGrubs = getDragonValue(allTeamData, 'void_grubs', isBlueTeam);
    const teamKills = getStatValue(allTeamData, 'teamkills');
    const teamDeaths = getStatValue(allTeamData, 'teamdeaths');
    const teamKpm = getStatValue(allTeamData, 'team kpm');
    const ckpm = getStatValue(allTeamData, 'ckpm');
    
    // Création des statistiques pour l'équipe
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
      dragons: dragonStats.total,
      opp_dragons: oppDragonStats.total,
      elemental_drakes: elementalDrakes || dragonStats.total, // Fallback
      opp_elemental_drakes: oppElementalDrakes || oppDragonStats.total, // Fallback
      infernals: dragonStats.infernals,
      mountains: dragonStats.mountains,
      clouds: dragonStats.clouds,
      oceans: dragonStats.oceans,
      chemtechs: dragonStats.chemtechs,
      hextechs: dragonStats.hextechs,
      drakes_unknown: dragonStats.unknown,
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
    // Traitement initial: convertir toutes les clés en minuscules pour comparaison insensible à la casse
    Object.entries(row).forEach(([key, value]) => {
      const lowerKey = key.toLowerCase();
      
      // Stocker la valeur dans les deux versions (originale et minuscule)
      combinedData[key] = combinedData[key] || value;
      
      // Si la valeur n'existe pas encore ou est vide, la définir
      if (value !== undefined && value !== null && value !== '') {
        // Pour les cases minuscules et majuscules, stocker les deux versions
        if (lowerKey !== key) {
          combinedData[lowerKey] = combinedData[lowerKey] || value;
          
          // Pour les clés spécifiques comme les dragons, toujours prendre la valeur la plus haute
          if (lowerKey.includes('dragon') || lowerKey.includes('drake') || 
              lowerKey.includes('infernal') || lowerKey.includes('mountain') || 
              lowerKey.includes('cloud') || lowerKey.includes('ocean') || 
              lowerKey.includes('chemtech') || lowerKey.includes('hextech')) {
              
            const newVal = safeParseInt(value);
            const existingVal = safeParseInt(combinedData[lowerKey]);
            
            if (newVal > existingVal) {
              combinedData[lowerKey] = value;
              combinedData[key] = value; // Mettre à jour aussi la clé d'origine
            }
          }
        }
      }
    });
    
    // Second passage pour normaliser les clés opp_ pour les dragons
    const drakeKeys = Object.keys(row).filter(k => 
      k.includes('dragon') || k.includes('drake') || 
      k.includes('infernal') || k.includes('mountain') || 
      k.includes('cloud') || k.includes('ocean') || 
      k.includes('chemtech') || k.includes('hextech')
    );
    
    // Ajouter des versions avec opp_ si elles n'existent pas déjà
    drakeKeys.forEach(key => {
      const value = row[key];
      if (value !== undefined && value !== null && value !== '') {
        // Si la clé ne commence pas par opp_, créer une version opp_
        if (!key.startsWith('opp_')) {
          const oppKey = `opp_${key}`;
          // Ne pas écraser les valeurs opp_ existantes
          if (!(oppKey in combinedData) || combinedData[oppKey] === undefined || 
              combinedData[oppKey] === null || combinedData[oppKey] === '') {
            combinedData[oppKey] = value;
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
  if (value === '1' || value.toLowerCase() === 'true' || value.toLowerCase() === 'yes') return teamId;
  
  // Si c'est "0" ou "false", ce n'est pas cette équipe
  if (value === '0' || value.toLowerCase() === 'false' || value.toLowerCase() === 'no') return null;
  
  // Sinon, on retourne la valeur telle quelle (pourrait être un nom d'équipe)
  return value;
}
