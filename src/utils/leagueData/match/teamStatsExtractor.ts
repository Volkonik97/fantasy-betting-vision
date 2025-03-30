
import { MatchTeamStats } from '../types';
import { LeagueGameDataRow } from '../../csv/types';
import { safeParseFloat, safeParseInt } from '../types';

/**
 * Extract team statistics from game rows, processing both blue and red teams independently
 */
export function extractTeamStats(
  gameId: string, 
  gameRows: LeagueGameDataRow[]
): Map<string, MatchTeamStats> {
  const teamStatsMap = new Map<string, MatchTeamStats>();
  
  // Sépare les lignes par équipe et côté (bleu/rouge)
  const blueTeamRows = gameRows.filter(row => row.side?.toLowerCase() === 'blue');
  const redTeamRows = gameRows.filter(row => row.side?.toLowerCase() === 'red');
  
  // S'il manque une des équipes, on affiche un avertissement
  if (blueTeamRows.length === 0 || redTeamRows.length === 0) {
    console.warn(`[Warning] Match ${gameId} - Missing team data: Blue=${blueTeamRows.length}, Red=${redTeamRows.length}`);
  }
  
  // Traiter l'équipe bleue
  if (blueTeamRows.length > 0) {
    processTeamRows(gameId, blueTeamRows, teamStatsMap);
  }
  
  // Traiter l'équipe rouge 
  if (redTeamRows.length > 0) {
    processTeamRows(gameId, redTeamRows, teamStatsMap);
  }
  
  // Debug pour certains matchs spécifiques
  if (['LOLTMNT02_215152', 'LOLTMNT02_222859'].includes(gameId)) {
    logMatchDebugInfo(gameId, teamStatsMap);
  }
  
  return teamStatsMap;
}

/**
 * Process all rows for a specific team and extract stats
 */
function processTeamRows(
  gameId: string, 
  teamRows: LeagueGameDataRow[], 
  teamStatsMap: Map<string, MatchTeamStats>
): void {
  if (teamRows.length === 0) return;
  
  // Utilise la première ligne comme référence pour les données de base d'équipe
  const baseRow = teamRows[0];
  if (!baseRow || !baseRow.teamid) return;
  
  const teamId = baseRow.teamid;
  const isBlueTeam = baseRow.side?.toLowerCase() === 'blue';
  
  // Combine les données de toutes les lignes pour cette équipe
  const allTeamData = combineTeamRowData(teamRows);
  
  // Détermine si cette équipe a obtenu les premiers objectifs
  const hasFirstBlood = getFirstObjectiveValue(allTeamData, 'firstblood', teamId);
  const hasFirstDragon = getFirstObjectiveValue(allTeamData, 'firstdragon', teamId);
  const hasFirstHerald = getFirstObjectiveValue(allTeamData, 'firstherald', teamId);
  const hasFirstBaron = getFirstObjectiveValue(allTeamData, 'firstbaron', teamId);
  const hasFirstTower = getFirstObjectiveValue(allTeamData, 'firsttower', teamId);
  const hasFirstMidTower = getFirstObjectiveValue(allTeamData, 'firstmidtower', teamId);
  const hasFirstThreeTowers = getFirstObjectiveValue(allTeamData, 'firsttothreetowers', teamId);
  
  // Extraire les statistiques des dragons directement des données de cette équipe
  const dragons = getStatValue(allTeamData, 'dragons');
  const infernals = getStatValue(allTeamData, 'infernals');
  const mountains = getStatValue(allTeamData, 'mountains');
  const clouds = getStatValue(allTeamData, 'clouds');
  const oceans = getStatValue(allTeamData, 'oceans');
  const chemtechs = getStatValue(allTeamData, 'chemtechs');
  const hextechs = getStatValue(allTeamData, 'hextechs');
  const drakesUnknown = getStatValue(allTeamData, 'drakes_unknown') || getStatValue(allTeamData, 'dragons (type unknown)');
  const elementalDrakes = getStatValue(allTeamData, 'elementaldrakes');
  
  // Extraire les autres statistiques d'objectifs
  const elders = getStatValue(allTeamData, 'elders');
  const heralds = getStatValue(allTeamData, 'heralds');
  const barons = getStatValue(allTeamData, 'barons');
  const towers = getStatValue(allTeamData, 'towers');
  const turretPlates = getStatValue(allTeamData, 'turretplates');
  const inhibitors = getStatValue(allTeamData, 'inhibitors');
  const voidGrubs = getStatValue(allTeamData, 'void_grubs');
  const teamKills = getStatValue(allTeamData, 'teamkills');
  const teamDeaths = getStatValue(allTeamData, 'teamdeaths');
  const teamKpm = getStatValue(allTeamData, 'team kpm');
  const ckpm = getStatValue(allTeamData, 'ckpm');
  
  // Créer l'objet de statistiques pour cette équipe
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
    opp_dragons: 0, // Ces valeurs ne sont plus utilisées, mais conservées pour compatibilité
    elemental_drakes: elementalDrakes || dragons, // Fallback si elementalDrakes n'est pas disponible
    opp_elemental_drakes: 0, // Ces valeurs ne sont plus utilisées, mais conservées pour compatibilité
    infernals: infernals,
    mountains: mountains,
    clouds: clouds,
    oceans: oceans,
    chemtechs: chemtechs,
    hextechs: hextechs,
    drakes_unknown: drakesUnknown,
    elders: elders,
    opp_elders: 0, // Ces valeurs ne sont plus utilisées, mais conservées pour compatibilité
    first_herald: hasFirstHerald,
    heralds: heralds,
    opp_heralds: 0, // Ces valeurs ne sont plus utilisées, mais conservées pour compatibilité
    first_baron: hasFirstBaron,
    barons: barons,
    opp_barons: 0, // Ces valeurs ne sont plus utilisées, mais conservées pour compatibilité
    void_grubs: voidGrubs,
    opp_void_grubs: 0, // Ces valeurs ne sont plus utilisées, mais conservées pour compatibilité
    first_tower: hasFirstTower,
    first_mid_tower: hasFirstMidTower,
    first_three_towers: hasFirstThreeTowers,
    towers: towers,
    opp_towers: 0, // Ces valeurs ne sont plus utilisées, mais conservées pour compatibilité
    turret_plates: turretPlates,
    opp_turret_plates: 0, // Ces valeurs ne sont plus utilisées, mais conservées pour compatibilité
    inhibitors: inhibitors,
    opp_inhibitors: 0 // Ces valeurs ne sont plus utilisées, mais conservées pour compatibilité
  });
}

/**
 * Log debug information for specific matches
 */
function logMatchDebugInfo(gameId: string, teamStatsMap: Map<string, MatchTeamStats>): void {
  console.log(`[Debug] Match ${gameId} - Team stats extracted:`, {
    teams: Array.from(teamStatsMap.entries()).map(([teamId, stats]) => ({
      teamId,
      side: stats.side,
      dragonStats: {
        total: stats.dragons,
        infernals: stats.infernals,
        mountains: stats.mountains,
        clouds: stats.clouds,
        oceans: stats.oceans,
        chemtechs: stats.chemtechs,
        hextechs: stats.hextechs,
        unknown: stats.drakes_unknown
      }
    }))
  });
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
      
      // Si la valeur n'existe pas encore ou est vide, la définir
      if (value !== undefined && value !== null && value !== '') {
        // Stocker la valeur dans les deux versions (originale et minuscule)
        combinedData[key] = combinedData[key] || value;
        
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
