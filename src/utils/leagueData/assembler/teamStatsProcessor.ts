import { LeagueGameDataRow } from '../../csv/types';

/**
 * Process team rows to extract statistics
 */
export function processTeamRows(
  rows: LeagueGameDataRow[], 
  matchId: string, 
  teamId: string, 
  isBlue: boolean
): any {
  if (rows.length === 0) {
    return null;
  }
  
  // Combine all data into a single structure
  const allTeamData: Record<string, any> = {};
  rows.forEach(row => {
    Object.entries(row).forEach(([key, value]) => {
      const lowerKey = key.toLowerCase();
      if (value !== undefined && value !== null && value !== '') {
        allTeamData[key] = allTeamData[key] || value;
        if (lowerKey !== key) {
          allTeamData[lowerKey] = allTeamData[lowerKey] || value;
        }
      }
    });
  });
  
  // Log raw data for debugging
  console.log(`[processTeamRows] Match ${matchId}, Team ${teamId}, raw data:`, {
    dragons: allTeamData.dragons,
    elementaldrakes: allTeamData.elementaldrakes,
    infernals: allTeamData.infernals,
    mountains: allTeamData.mountains,
    clouds: allTeamData.clouds,
    oceans: allTeamData.oceans,
    chemtechs: allTeamData.chemtechs,
    hextechs: allTeamData.hextechs,
    dragons_type_unknown: allTeamData.dragons_type_unknown,
    heralds: allTeamData.heralds,
    barons: allTeamData.barons,
    towers: allTeamData.towers,
    turretplates: allTeamData.turretplates,
    inhibitors: allTeamData.inhibitors,
    void_grubs: allTeamData.void_grubs
  });
  
  // Use the first row for team stats
  const row = rows[0];
  
  // Extract values with alternative name lookup
  const getStatWithAlternatives = (alternatives: string[]): number => {
    for (const alt of alternatives) {
      const value = allTeamData[alt] || allTeamData[alt.toLowerCase()];
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'string') {
          const num = parseInt(value.trim());
          if (!isNaN(num)) return num;
          if (value.toLowerCase() === 'true' || value === '1') return 1;
        } 
        else if (typeof value === 'number') {
          return value;
        }
        else if (value === true) {
          return 1;
        }
      }
    }
    return 0;
  };
  
  // List of alternatives for each stat type
  const dragonAlts = ['dragons', 'dragon', 'drakes', 'drake'];
  const elementalDrakeAlts = ['elementaldrakes', 'elemental_drakes', 'elemental', 'elementals'];
  const infernalAlts = ['infernals', 'infernal', 'infernal_drake', 'infernal_drakes'];
  const mountainAlts = ['mountains', 'mountain', 'mountain_drake', 'mountain_drakes'];
  const cloudAlts = ['clouds', 'cloud', 'cloud_drake', 'cloud_drakes'];
  const oceanAlts = ['oceans', 'ocean', 'ocean_drake', 'ocean_drakes'];
  const chemtechAlts = ['chemtechs', 'chemtech', 'chemtech_drake', 'chemtech_drakes'];
  const hextechAlts = ['hextechs', 'hextech', 'hextech_drake', 'hextech_drakes'];
  const unknownDrakeAlts = ['dragons (type unknown)', 'dragons_type_unknown', 'drakes_unknown'];
  const elderAlts = ['elders', 'elder', 'elderdragon', 'elder_dragon'];
  
  // Alternatives for objectives
  const heraldAlts = ['heralds', 'herald', 'riftherald', 'rift_herald', 'rift_heralds'];
  const baronAlts = ['barons', 'baron', 'baron_nashor', 'baronnashor'];
  const towerAlts = ['towers', 'tower', 'turrets', 'turret'];
  const turretPlateAlts = ['turretplates', 'turret_plates', 'plates'];
  const inhibitorAlts = ['inhibitors', 'inhibitor', 'inhibs', 'inhib'];
  const voidGrubAlts = ['void_grubs', 'voidgrubs', 'void_grub', 'voidgrub'];
  
  // Extract dragon values
  const dragons = getStatWithAlternatives(dragonAlts);
  const elementalDrakes = getStatWithAlternatives(elementalDrakeAlts);
  const infernals = getStatWithAlternatives(infernalAlts);
  const mountains = getStatWithAlternatives(mountainAlts);
  const clouds = getStatWithAlternatives(cloudAlts);
  const oceans = getStatWithAlternatives(oceanAlts);
  const chemtechs = getStatWithAlternatives(chemtechAlts);
  const hextechs = getStatWithAlternatives(hextechAlts);
  const drakesUnknown = getStatWithAlternatives(unknownDrakeAlts);
  const elders = getStatWithAlternatives(elderAlts);
  
  // Extract objective values
  const heralds = getStatWithAlternatives(heraldAlts);
  const barons = getStatWithAlternatives(baronAlts);
  const towers = getStatWithAlternatives(towerAlts);
  const turretPlates = getStatWithAlternatives(turretPlateAlts);
  const inhibitors = getStatWithAlternatives(inhibitorAlts);
  const voidGrubs = getStatWithAlternatives(voidGrubAlts);
  
  // Log extracted values
  console.log(`[processTeamRows] Match ${matchId}, Team ${teamId}, extracted values:`, {
    dragons, elementalDrakes, infernals, mountains, clouds, oceans, chemtechs, hextechs, drakesUnknown, elders,
    heralds, barons, towers, turretPlates, inhibitors, voidGrubs
  });
  
  // Create team stats object with all statistics
  const stats = {
    team_id: teamId,
    match_id: matchId,
    is_blue_side: isBlue,
    team_kpm: parseFloat(row.team_kpm || '0') || 0,
    ckpm: parseFloat(row.ckpm || '0') || 0,
    kills: parseInt(row.teamkills || '0') || 0,
    deaths: parseInt(row.teamdeaths || '0') || 0,
    
    // Dragons - ensure all stats are there
    dragons,
    elemental_drakes: elementalDrakes,
    infernals,
    mountains,
    clouds,
    oceans,
    chemtechs,
    hextechs,
    drakes_unknown: drakesUnknown,
    
    // Other objectives
    elders,
    heralds,
    barons,
    towers,
    turret_plates: turretPlates,
    inhibitors,
    void_grubs: voidGrubs,
    
    // First objectives
    first_blood: row.firstblood === 'True' || row.firstblood === '1',
    first_dragon: row.firstdragon === 'True' || row.firstdragon === '1',
    first_herald: row.firstherald === 'True' || row.firstherald === '1',
    first_baron: row.firstbaron === 'True' || row.firstbaron === '1',
    first_tower: row.firsttower === 'True' || row.firsttower === '1',
    first_mid_tower: row.firstmidtower === 'True' || row.firstmidtower === '1',
    first_three_towers: row.firsttothreetowers === 'True' || row.firsttothreetowers === '1'
  };
  
  return stats;
}
