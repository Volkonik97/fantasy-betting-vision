import { safeConvertToString } from './utils';

/**
 * Extract objective statistics from team stats
 */
export function extractObjectiveStats(teamBlueStats: any, teamRedStats: any, gameId: string): any {
  let stats: any = {};
  
  // If blue team stats are available, extract from there
  if (teamBlueStats) {
    stats = extractStatsFromBlueTeam(teamBlueStats);
    
    // If red team stats are available too, extract additional data
    if (teamRedStats) {
      stats = { ...stats, ...extractOpponentStatsFromRedTeam(teamRedStats) };
    }
  }
  // Otherwise, if only red team stats are available, use them
  else if (teamRedStats) {
    stats = extractStatsFromRedTeam(teamRedStats);
  }
  
  return stats;
}

/**
 * Extract stats when blue team data is available
 */
function extractStatsFromBlueTeam(teamBlueStats: any): any {
  return {
    // Basic game stats
    teamKpm: safeConvertToString(teamBlueStats.team_kpm),
    ckpm: safeConvertToString(teamBlueStats.ckpm),
    teamKills: safeConvertToString(teamBlueStats.team_kills),
    teamDeaths: safeConvertToString(teamBlueStats.team_deaths),
    
    // First objectives
    firstBlood: teamBlueStats.first_blood || '',
    firstDragon: teamBlueStats.first_dragon || '',
    firstHerald: teamBlueStats.first_herald || '',
    firstBaron: teamBlueStats.first_baron || '',
    firstTower: teamBlueStats.first_tower || '',
    firstMidTower: teamBlueStats.first_mid_tower || '',
    firstThreeTowers: teamBlueStats.first_three_towers || '',
    
    // Dragon stats
    dragons: safeConvertToString(teamBlueStats.dragons),
    elementalDrakes: safeConvertToString(teamBlueStats.elemental_drakes),
    infernals: safeConvertToString(teamBlueStats.infernals),
    mountains: safeConvertToString(teamBlueStats.mountains),
    clouds: safeConvertToString(teamBlueStats.clouds),
    oceans: safeConvertToString(teamBlueStats.oceans),
    chemtechs: safeConvertToString(teamBlueStats.chemtechs),
    hextechs: safeConvertToString(teamBlueStats.hextechs),
    drakesUnknown: safeConvertToString(teamBlueStats.drakes_unknown),
    elders: safeConvertToString(teamBlueStats.elders),
    
    // Other objectives
    heralds: safeConvertToString(teamBlueStats.heralds),
    barons: safeConvertToString(teamBlueStats.barons),
    voidGrubs: safeConvertToString(teamBlueStats.void_grubs),
    towers: safeConvertToString(teamBlueStats.towers),
    turretPlates: safeConvertToString(teamBlueStats.turret_plates),
    inhibitors: safeConvertToString(teamBlueStats.inhibitors),
    
    // Opponent objective stats
    oppDragons: safeConvertToString(teamBlueStats.opp_dragons),
    oppElementalDrakes: safeConvertToString(teamBlueStats.opp_elemental_drakes),
    oppElders: safeConvertToString(teamBlueStats.opp_elders),
    oppHeralds: safeConvertToString(teamBlueStats.opp_heralds),
    oppBarons: safeConvertToString(teamBlueStats.opp_barons),
    oppVoidGrubs: safeConvertToString(teamBlueStats.opp_void_grubs),
    oppTowers: safeConvertToString(teamBlueStats.opp_towers),
    oppTurretPlates: safeConvertToString(teamBlueStats.opp_turret_plates),
    oppInhibitors: safeConvertToString(teamBlueStats.opp_inhibitors)
  };
}

/**
 * Extract opponent-specific stats from red team data
 */
function extractOpponentStatsFromRedTeam(teamRedStats: any): any {
  return {
    // Extract specific dragon stats from red team
    oppInfernals: safeConvertToString(teamRedStats.infernals),
    oppMountains: safeConvertToString(teamRedStats.mountains),
    oppClouds: safeConvertToString(teamRedStats.clouds),
    oppOceans: safeConvertToString(teamRedStats.oceans),
    oppChemtechs: safeConvertToString(teamRedStats.chemtechs),
    oppHextechs: safeConvertToString(teamRedStats.hextechs),
    oppDrakesUnknown: safeConvertToString(teamRedStats.drakes_unknown)
  };
}

/**
 * Extract stats when only red team data is available
 */
function extractStatsFromRedTeam(teamRedStats: any): any {
  return {
    // Basic game stats - using red team perspective
    teamKpm: safeConvertToString(teamRedStats.team_kpm),
    ckpm: safeConvertToString(teamRedStats.ckpm),
    teamKills: safeConvertToString(teamRedStats.team_kills),
    teamDeaths: safeConvertToString(teamRedStats.team_deaths),
    
    // First objectives
    firstBlood: teamRedStats.first_blood || '',
    firstDragon: teamRedStats.first_dragon || '',
    firstHerald: teamRedStats.first_herald || '',
    firstBaron: teamRedStats.first_baron || '',
    firstTower: teamRedStats.first_tower || '',
    firstMidTower: teamRedStats.first_mid_tower || '',
    firstThreeTowers: teamRedStats.first_three_towers || '',
    
    // Dragon stats - swapping team and opponent stats
    dragons: safeConvertToString(teamRedStats.opp_dragons),
    oppDragons: safeConvertToString(teamRedStats.dragons),
    elementalDrakes: safeConvertToString(teamRedStats.opp_elemental_drakes),
    oppElementalDrakes: safeConvertToString(teamRedStats.elemental_drakes),
    
    // Red team dragon stats become opponent stats for blue team perspective
    oppInfernals: safeConvertToString(teamRedStats.infernals),
    oppMountains: safeConvertToString(teamRedStats.mountains),
    oppClouds: safeConvertToString(teamRedStats.clouds),
    oppOceans: safeConvertToString(teamRedStats.oceans),
    oppChemtechs: safeConvertToString(teamRedStats.chemtechs),
    oppHextechs: safeConvertToString(teamRedStats.hextechs),
    oppDrakesUnknown: safeConvertToString(teamRedStats.drakes_unknown),
    
    // Blue team dragon stats from red team's opponent perspective
    infernals: safeConvertToString(teamRedStats.opp_infernals),
    mountains: safeConvertToString(teamRedStats.opp_mountains),
    clouds: safeConvertToString(teamRedStats.opp_clouds),
    oceans: safeConvertToString(teamRedStats.opp_oceans),
    chemtechs: safeConvertToString(teamRedStats.opp_chemtechs),
    hextechs: safeConvertToString(teamRedStats.opp_hextechs),
    drakesUnknown: safeConvertToString(teamRedStats.opp_drakes_unknown),
    
    // Other objectives with swapped perspective
    elders: safeConvertToString(teamRedStats.opp_elders),
    oppElders: safeConvertToString(teamRedStats.elders),
    heralds: safeConvertToString(teamRedStats.opp_heralds),
    oppHeralds: safeConvertToString(teamRedStats.heralds),
    barons: safeConvertToString(teamRedStats.opp_barons),
    oppBarons: safeConvertToString(teamRedStats.barons),
    voidGrubs: safeConvertToString(teamRedStats.opp_void_grubs),
    oppVoidGrubs: safeConvertToString(teamRedStats.void_grubs),
    towers: safeConvertToString(teamRedStats.opp_towers),
    oppTowers: safeConvertToString(teamRedStats.towers),
    turretPlates: safeConvertToString(teamRedStats.opp_turret_plates),
    oppTurretPlates: safeConvertToString(teamRedStats.turret_plates),
    inhibitors: safeConvertToString(teamRedStats.opp_inhibitors),
    oppInhibitors: safeConvertToString(teamRedStats.inhibitors)
  };
}
