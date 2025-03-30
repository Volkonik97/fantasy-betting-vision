
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
    
    // Récupérer explicitement les données pour l'équipe actuelle (blue ou red)
    const isBlueTeam = baseRow.side?.toLowerCase() === 'blue';
    const drakePrefix = isBlueTeam ? '' : 'opp_';
    
    // Parse numeric values with explicit type handling and prefixing for dragon data
    const dragons = getStatValue(allTeamData, `${drakePrefix}dragons`) || getStatValue(allTeamData, 'dragons');
    const elementalDrakes = getStatValue(allTeamData, `${drakePrefix}elementaldrakes`) || getStatValue(allTeamData, 'elementaldrakes');
    
    // Parse specific drake types using the appropriate prefix
    const infernals = getStatValue(allTeamData, `${drakePrefix}infernals`) || getStatValue(allTeamData, 'infernals');
    const mountains = getStatValue(allTeamData, `${drakePrefix}mountains`) || getStatValue(allTeamData, 'mountains');
    const clouds = getStatValue(allTeamData, `${drakePrefix}clouds`) || getStatValue(allTeamData, 'clouds');
    const oceans = getStatValue(allTeamData, `${drakePrefix}oceans`) || getStatValue(allTeamData, 'oceans');
    const chemtechs = getStatValue(allTeamData, `${drakePrefix}chemtechs`) || getStatValue(allTeamData, 'chemtechs');
    const hextechs = getStatValue(allTeamData, `${drakePrefix}hextechs`) || getStatValue(allTeamData, 'hextechs');
    const drakesUnknown = getStatValue(allTeamData, `${drakePrefix}drakes_unknown`) || getStatValue(allTeamData, `${drakePrefix}dragons (type unknown)`) || getStatValue(allTeamData, 'dragons (type unknown)');
    
    // Make sure we get the right data for opponent team
    const oppPrefix = isBlueTeam ? 'opp_' : '';
    const oppDragons = getStatValue(allTeamData, `${oppPrefix}dragons`);
    const oppElementalDrakes = getStatValue(allTeamData, `${oppPrefix}elementaldrakes`);
    const oppInfernals = getStatValue(allTeamData, `${oppPrefix}infernals`);
    const oppMountains = getStatValue(allTeamData, `${oppPrefix}mountains`);
    const oppClouds = getStatValue(allTeamData, `${oppPrefix}clouds`);
    const oppOceans = getStatValue(allTeamData, `${oppPrefix}oceans`);
    const oppChemtechs = getStatValue(allTeamData, `${oppPrefix}chemtechs`);
    const oppHextechs = getStatValue(allTeamData, `${oppPrefix}hextechs`);
    const oppDrakesUnknown = getStatValue(allTeamData, `${oppPrefix}drakes_unknown`) || getStatValue(allTeamData, `${oppPrefix}dragons (type unknown)`);
    
    const elders = getStatValue(allTeamData, `${drakePrefix}elders`);
    const oppElders = getStatValue(allTeamData, `${oppPrefix}elders`);
    const heralds = getStatValue(allTeamData, `${drakePrefix}heralds`);
    const oppHeralds = getStatValue(allTeamData, `${oppPrefix}heralds`);
    const barons = getStatValue(allTeamData, `${drakePrefix}barons`);
    const oppBarons = getStatValue(allTeamData, `${oppPrefix}barons`);
    const towers = getStatValue(allTeamData, `${drakePrefix}towers`);
    const oppTowers = getStatValue(allTeamData, `${oppPrefix}towers`);
    const turretPlates = getStatValue(allTeamData, `${drakePrefix}turretplates`);
    const oppTurretPlates = getStatValue(allTeamData, `${oppPrefix}turretplates`);
    const inhibitors = getStatValue(allTeamData, `${drakePrefix}inhibitors`);
    const oppInhibitors = getStatValue(allTeamData, `${oppPrefix}inhibitors`);
    const voidGrubs = getStatValue(allTeamData, `${drakePrefix}void_grubs`);
    const oppVoidGrubs = getStatValue(allTeamData, `${oppPrefix}void_grubs`);
    const teamKills = getStatValue(allTeamData, 'teamkills');
    const teamDeaths = getStatValue(allTeamData, 'teamdeaths');
    const teamKpm = getStatValue(allTeamData, 'team kpm');
    const ckpm = getStatValue(allTeamData, 'ckpm');
    
    // Log detailed drake information for debugging
    if (['LOLTMNT02_215152', 'LOLTMNT02_222859'].includes(gameId)) {
      console.log(`[Extraction] Match ${gameId}, Équipe ${teamId} (${baseRow.side}) - données détaillées des dragons:`, {
        isBlueTeam,
        drakePrefix,
        rawData: {
          allKeys: Object.keys(allTeamData)
            .filter(k => k.includes('dragon') || k.includes('drake') || 
                        k.includes('infernal') || k.includes('mountain') || 
                        k.includes('cloud') || k.includes('ocean') || 
                        k.includes('chemtech') || k.includes('hextech'))
            .reduce((obj, key) => ({...obj, [key]: allTeamData[key]}), {})
        },
        extractedStats: {
          dragons,
          infernals,
          mountains,
          clouds,
          oceans,
          chemtechs,
          hextechs,
          drakesUnknown
        },
        opponent: {
          dragons: oppDragons,
          infernals: oppInfernals,
          mountains: oppMountains,
          clouds: oppClouds,
          oceans: oppOceans,
          chemtechs: oppChemtechs,
          hextechs: oppHextechs
        }
      });
    }
    
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
  const result = isNaN(parsed) ? safeParseInt(value) : parsed;
  
  // Extra debug logging for specific drake fields if the statKey contains drake-related words
  if (statKey.includes('dragon') || statKey.includes('drake') ||
      statKey.includes('cloud') || statKey.includes('infernal') || 
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
