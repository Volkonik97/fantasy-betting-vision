import { MatchTeamStats } from '../types';
import { LeagueGameDataRow } from '../../csv/types';
import { safeParseFloat, safeParseInt } from '../utils';

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
  
  console.log(`[teamStatsExtractor] Processing team ${teamId} for match ${gameId}, found ${teamRows.length} rows`);
  
  // Détermine si cette équipe a obtenu les premiers objectifs
  // Amélioration: Utilisation d'une fonction améliorée pour mieux détecter les objectifs
  const hasFirstBlood = parseObjectiveValue(allTeamData, ['firstblood', 'first_blood', 'first blood'], teamId);
  const hasFirstDragon = parseObjectiveValue(allTeamData, ['firstdragon', 'first_dragon', 'first dragon'], teamId);
  const hasFirstHerald = parseObjectiveValue(allTeamData, ['firstherald', 'first_herald', 'first herald'], teamId);
  const hasFirstBaron = parseObjectiveValue(allTeamData, ['firstbaron', 'first_baron', 'first baron'], teamId);
  const hasFirstTower = parseObjectiveValue(allTeamData, ['firsttower', 'first_tower', 'first tower'], teamId);
  const hasFirstMidTower = parseObjectiveValue(allTeamData, ['firstmidtower', 'first_mid_tower', 'first mid tower', 'first middle tower'], teamId);
  const hasFirstThreeTowers = parseObjectiveValue(allTeamData, ['firsttothreetowers', 'first_three_towers', 'first to three towers', 'first 3 towers'], teamId);
  
  // Extraire les stats de base
  const teamKills = getStatValue(allTeamData, 'teamkills');
  const teamDeaths = getStatValue(allTeamData, 'teamdeaths');
  const teamKpm = getStatValue(allTeamData, 'team kpm');
  const ckpm = getStatValue(allTeamData, 'ckpm');
  
  // Liste complète des noms alternatifs possibles pour les colonnes de dragons
  const dragonAlternatives = [
    'dragons', 'dragon', 'drakes', 'drake', 'dragons_taken', 'drakes_taken', 'total_dragons', 'total_drakes'
  ];
  
  const elementalDrakeAlternatives = [
    'elementaldrakes', 'elemental_drakes', 'elemental', 'elementals', 'elementaldrake', 'elemental_drake'
  ];
  
  const infernalAlternatives = [
    'infernals', 'infernal', 'infernal_drake', 'infernal_drakes', 'infernaldrake', 'infernaldrakes'
  ];
  
  const mountainAlternatives = [
    'mountains', 'mountain', 'mountain_drake', 'mountain_drakes', 'mountaindrake', 'mountaindrakes'
  ];
  
  const cloudAlternatives = [
    'clouds', 'cloud', 'cloud_drake', 'cloud_drakes', 'clouddrake', 'clouddrakes'
  ];
  
  const oceanAlternatives = [
    'oceans', 'ocean', 'ocean_drake', 'ocean_drakes', 'oceandrake', 'oceandrakes'
  ];
  
  const chemtechAlternatives = [
    'chemtechs', 'chemtech', 'chemtech_drake', 'chemtech_drakes', 'chemtechdrake', 'chemtechdrakes'
  ];
  
  const hextechAlternatives = [
    'hextechs', 'hextech', 'hextech_drake', 'hextech_drakes', 'hextechdrake', 'hextechdrakes'
  ];
  
  const unknownDrakeAlternatives = [
    'dragons (type unknown)', 'dragons_type_unknown', 'drakes_unknown', 'unknown_drakes', 'unknown_dragons'
  ];
  
  const elderAlternatives = [
    'elders', 'elder', 'elderdragon', 'elder_dragon', 'elder_dragons', 'elderdragons'
  ];
  
  // Extraire les statistiques de dragons avec recherche de noms alternatifs
  const dragons = findStatValueWithAlternatives(allTeamData, dragonAlternatives);
  const elementalDrakes = findStatValueWithAlternatives(allTeamData, elementalDrakeAlternatives);
  const infernals = findStatValueWithAlternatives(allTeamData, infernalAlternatives);
  const mountains = findStatValueWithAlternatives(allTeamData, mountainAlternatives);
  const clouds = findStatValueWithAlternatives(allTeamData, cloudAlternatives);
  const oceans = findStatValueWithAlternatives(allTeamData, oceanAlternatives);
  const chemtechs = findStatValueWithAlternatives(allTeamData, chemtechAlternatives);
  const hextechs = findStatValueWithAlternatives(allTeamData, hextechAlternatives);
  const drakesUnknown = findStatValueWithAlternatives(allTeamData, unknownDrakeAlternatives);
  const elders = findStatValueWithAlternatives(allTeamData, elderAlternatives);
  
  // Extraire les autres statistiques d'objectifs avec les alternatives
  const heraldAlternatives = ['heralds', 'herald', 'riftherald', 'rift_herald', 'rift_heralds', 'riftherald', 'riftherald_taken', 'heralds_taken'];
  const baronAlternatives = ['barons', 'baron', 'baron_nashor', 'baronnashor', 'barons_taken', 'baron_taken'];
  const towerAlternatives = ['towers', 'tower', 'turrets', 'turret', 'towers_taken', 'turrets_taken'];
  const turretPlateAlternatives = ['turretplates', 'turret_plates', 'plates', 'turretplates_taken', 'plates_taken'];
  const inhibitorAlternatives = ['inhibitors', 'inhibitor', 'inhibs', 'inhib', 'inhibitors_taken', 'inhibs_taken'];
  const voidGrubAlternatives = ['void_grubs', 'voidgrubs', 'void_grub', 'voidgrub', 'voidgrub_taken', 'voidgrubs_taken'];
  
  const heralds = findStatValueWithAlternatives(allTeamData, heraldAlternatives);
  const barons = findStatValueWithAlternatives(allTeamData, baronAlternatives);
  const towers = findStatValueWithAlternatives(allTeamData, towerAlternatives);
  const turretPlates = findStatValueWithAlternatives(allTeamData, turretPlateAlternatives);
  const inhibitors = findStatValueWithAlternatives(allTeamData, inhibitorAlternatives);
  const voidGrubs = findStatValueWithAlternatives(allTeamData, voidGrubAlternatives);
  
  // Log détaillé des objectifs pour le débogage
  console.log(`[teamStatsExtractor] Match ${gameId}, Team ${teamId} - Raw objective values:`, {
    heralds: findRawValue(allTeamData, heraldAlternatives),
    barons: findRawValue(allTeamData, baronAlternatives),
    towers: findRawValue(allTeamData, towerAlternatives),
    turretPlates: findRawValue(allTeamData, turretPlateAlternatives),
    inhibitors: findRawValue(allTeamData, inhibitorAlternatives),
    voidGrubs: findRawValue(allTeamData, voidGrubAlternatives)
  });
  
  console.log(`[teamStatsExtractor] Match ${gameId}, Team ${teamId} - Parsed objective values:`, {
    heralds, barons, towers, turretPlates, inhibitors, voidGrubs
  });
  
  // Log pour les first objectives
  console.log(`[teamStatsExtractor] Match ${gameId}, Team ${teamId} - First objectives:`, {
    firstBlood: hasFirstBlood,
    firstDragon: hasFirstDragon,
    firstHerald: hasFirstHerald,
    firstBaron: hasFirstBaron,
    firstTower: hasFirstTower,
    firstMidTower: hasFirstMidTower,
    firstThreeTowers: hasFirstThreeTowers,
    rawValues: {
      firstBlood: findRawValue(allTeamData, ['firstblood', 'first_blood']),
      firstDragon: findRawValue(allTeamData, ['firstdragon', 'first_dragon']),
      firstHerald: findRawValue(allTeamData, ['firstherald', 'first_herald']),
      firstBaron: findRawValue(allTeamData, ['firstbaron', 'first_baron']),
      firstTower: findRawValue(allTeamData, ['firsttower', 'first_tower']),
      firstMidTower: findRawValue(allTeamData, ['firstmidtower', 'first_mid_tower']),
      firstThreeTowers: findRawValue(allTeamData, ['firsttothreetowers', 'first_three_towers'])
    }
  });
  
  // Log détaillé pour le débogage des dragons
  console.log(`[teamStatsExtractor] Match ${gameId}, Team ${teamId} - Raw dragon values:`, { 
    dragons: findRawValue(allTeamData, dragonAlternatives),
    elementalDrakes: findRawValue(allTeamData, elementalDrakeAlternatives),
    infernals: findRawValue(allTeamData, infernalAlternatives),
    mountains: findRawValue(allTeamData, mountainAlternatives),
    clouds: findRawValue(allTeamData, cloudAlternatives),
    oceans: findRawValue(allTeamData, oceanAlternatives),
    chemtechs: findRawValue(allTeamData, chemtechAlternatives),
    hextechs: findRawValue(allTeamData, hextechAlternatives),
    unknown: findRawValue(allTeamData, unknownDrakeAlternatives),
    elders: findRawValue(allTeamData, elderAlternatives)
  });
  
  console.log(`[teamStatsExtractor] Match ${gameId}, Team ${teamId} - Parsed dragon values:`, { 
    dragons, elementalDrakes, infernals, mountains, clouds, oceans, chemtechs, hextechs, drakesUnknown, elders
  });
  
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
    elemental_drakes: elementalDrakes,
    infernals: infernals,
    mountains: mountains,
    clouds: clouds,
    oceans: oceans,
    chemtechs: chemtechs,
    hextechs: hextechs,
    drakes_unknown: drakesUnknown,
    elders: elders,
    first_herald: hasFirstHerald,
    heralds: heralds,
    first_baron: hasFirstBaron,
    barons: barons,
    void_grubs: voidGrubs,
    first_tower: hasFirstTower,
    first_mid_tower: hasFirstMidTower,
    first_three_towers: hasFirstThreeTowers,
    towers: towers,
    turret_plates: turretPlates,
    inhibitors: inhibitors
  });
}

/**
 * Analyse et interprète correctement les valeurs d'objectifs premiers
 * Nouvelle fonction plus robuste pour traiter les formats variés
 */
function parseObjectiveValue(data: Record<string, any>, objectiveKeys: string[], teamId: string): boolean {
  // Vérifier toutes les clés possibles
  for (const key of objectiveKeys) {
    // Essayer avec la clé originale et sa version en minuscules
    const rawValue = data[key] !== undefined ? data[key] : data[key.toLowerCase()];
    
    if (rawValue === undefined || rawValue === null) continue;
    
    // Log détaillé pour le débogage
    console.log(`[parseObjectiveValue] Key: ${key}, Raw value: ${rawValue}, Type: ${typeof rawValue}, TeamId: ${teamId}`);
    
    // Cas 1: La valeur est le nom/ID de l'équipe
    if (typeof rawValue === 'string' && 
        (rawValue === teamId || rawValue.toLowerCase() === teamId.toLowerCase())) {
      return true;
    }
    
    // Cas 2: La valeur est "True", "1", "Yes", etc.
    if (typeof rawValue === 'string') {
      const normValue = rawValue.toLowerCase().trim();
      // CORRECTION ICI: Ajout de vérification pour "1" et autres valeurs vrai/faux
      if (['true', '1', 'yes', 'oui', 't', 'y'].includes(normValue)) {
        return true;
      }
      if (['false', '0', 'no', 'non', 'f', 'n'].includes(normValue)) {
        return false;
      }
      
      // Cas 3: Si c'est une autre chaîne non vide, cela pourrait être l'ID d'une autre équipe
      if (rawValue !== '' && !['false', '0', 'no', 'non', 'f', 'n', 'null', 'undefined'].includes(normValue)) {
        // Si c'est un autre ID d'équipe, alors notre équipe n'a pas eu l'objectif
        return false;
      }
    }
    
    // Cas 4: Valeur booléenne directe
    if (typeof rawValue === 'boolean') {
      return rawValue;
    }
    
    // Cas 5: Valeur numérique (1 = vrai, 0 = faux)
    if (typeof rawValue === 'number') {
      return rawValue === 1;
    }
  }
  
  // Par défaut, si aucune information n'est trouvée, on suppose que l'équipe n'a pas obtenu l'objectif
  return false;
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
        }
      }
    });
  });
  
  return combinedData;
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
    // Si c'est un nombre sous forme de chaîne, analysez-le
    const parsedNumber = parseFloat(value);
    if (!isNaN(parsedNumber)) {
      return parsedNumber;
    }
    // CORRECTION ICI: Meilleure gestion des chaînes "1" et "true"
    // Si c'est "1" ou "true", convert to 1
    if (value.toLowerCase() === 'true' || value === '1' || value.toLowerCase() === 'yes') {
      return 1;
    }
    // Si c'est "0" ou "false", convert to 0
    if (value.toLowerCase() === 'false' || value === '0' || value.toLowerCase() === 'no') {
      return 0;
    }
  } else if (typeof value === 'number') {
    return value;
  } else if (value === true) {
    return 1;
  } else if (value === false) {
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
  
  // CORRECTION ICI: Meilleure gestion des chaînes "1" et "true"
  // Si c'est "1" ou "true", on considère que c'est cette équipe
  if (value === '1' || value.toLowerCase() === 'true' || value.toLowerCase() === 'yes') return teamId;
  
  // Si c'est "0" ou "false", ce n'est pas cette équipe
  if (value === '0' || value.toLowerCase() === 'false' || value.toLowerCase() === 'no') return null;
  
  // Sinon, on retourne la valeur telle quelle (pourrait être un nom d'équipe)
  return value;
}

/**
 * Recherche une valeur statistique en essayant plusieurs noms de colonnes alternatifs
 */
function findStatValueWithAlternatives(data: Record<string, any>, alternatives: string[]): number {
  // D'abord, essayez d'obtenir des valeurs numériques directes
  for (const alt of alternatives) {
    const value = data[alt] || data[alt.toLowerCase()];
    if (value !== undefined && value !== null && value !== '') {
      // Si la valeur est une chaîne, essayez de la convertir en nombre
      if (typeof value === 'string') {
        // Si c'est un nombre sous forme de chaîne, analysez-le
        const parsedNumber = parseFloat(value);
        if (!isNaN(parsedNumber)) {
          return parsedNumber;
        }
        // CORRECTION ICI: Meilleure gestion des chaînes "1" et "true"
        // Si c'est "true" ou "1", retourner 1
        if (value.toLowerCase() === 'true' || value === '1') {
          return 1;
        }
      } 
      // Si c'est déjà un nombre
      else if (typeof value === 'number') {
        return value;
      }
      // Si c'est un booléen "true"
      else if (value === true) {
        return 1;
      }
    }
  }

  // Si aucune valeur directe n'est trouvée, essayez d'analyser la valeur en tant que nombre
  for (const alt of alternatives) {
    const value = getStatValue(data, alt);
    if (value > 0) {
      return value;
    }
  }
  return 0;
}

/**
 * Récupère la valeur brute (non parsée) pour le débogage
 */
function findRawValue(data: Record<string, any>, alternatives: string[]): any {
  for (const alt of alternatives) {
    if (data[alt] !== undefined) {
      return data[alt];
    }
    
    // Essayer aussi la version en minuscules
    if (data[alt.toLowerCase()] !== undefined) {
      return data[alt.toLowerCase()];
    }
  }
  return 'not found';
}
