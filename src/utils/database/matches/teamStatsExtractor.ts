
import { Match } from "@/utils/models/types";

/**
 * Extract team-specific stats from a match object
 * @param match The match object
 * @param teamId The ID of the team to extract stats for
 * @returns Object containing team-specific stats
 */
export function extractTeamSpecificStats(match: Match, teamId: string): any {
  if (!match || !match.extraStats) {
    console.log(`No match extra stats found for match ${match?.id || 'unknown'}`);
    return null;
  }

  // Determine if this team is blue or red
  const isBlueTeam = match.teamBlue?.id === teamId;
  const side = isBlueTeam ? 'blue' : 'red';
  const oppSide = isBlueTeam ? 'red' : 'blue';
  
  // Determine if team won
  let isWinner = false;
  if (match.result && match.result.winner) {
    isWinner = match.result.winner === teamId;
  } else if (match.winner_team_id) {
    isWinner = match.winner_team_id === teamId;
  }
  
  console.log(`Extracting ${side} side stats for team ${teamId} from match ${match.id}, isWinner: ${isWinner}`);

  // Process objective stats
  // For some objectives, we need to check if the team achieved them first
  const firstBlood = processFirstObjective(match, 'first_blood', teamId);
  const firstDragon = processFirstObjective(match, 'first_dragon', teamId);
  const firstHerald = processFirstObjective(match, 'first_herald', teamId);
  const firstTower = processFirstObjective(match, 'first_tower', teamId);
  const firstBaron = processFirstObjective(match, 'first_baron', teamId);
  const firstMidTower = processFirstObjective(match, 'first_mid_tower', teamId);
  const firstThreeTowers = processFirstObjective(match, 'first_three_towers', teamId);
  
  console.log(`First objectives for team ${teamId} in match ${match.id}:`, {
    firstBlood,
    firstDragon,
    firstHerald,
    firstTower,
    firstBaron,
    firstMidTower,
    firstThreeTowers
  });
  
  // Extract own team stats
  const teamStats = {
    team_id: teamId,
    match_id: match.id,
    side: side,
    is_blue_side: isBlueTeam,
    is_winner: isWinner,
    
    // First objectives
    first_blood: firstBlood,
    first_dragon: firstDragon,
    first_herald: firstHerald,
    first_tower: firstTower,
    first_baron: firstBaron,
    first_mid_tower: firstMidTower,
    first_three_towers: firstThreeTowers,
    
    // Team stats
    kills: match.extraStats.team_kills,
    deaths: match.extraStats.team_deaths,
    kpm: match.extraStats.team_kpm,
    
    // Dragon stats
    dragons: isBlueTeam ? match.extraStats.dragons : match.extraStats.opp_dragons,
    elemental_drakes: isBlueTeam ? match.extraStats.elemental_drakes : match.extraStats.opp_elemental_drakes,
    infernals: isBlueTeam ? match.extraStats.infernals : match.extraStats.opp_infernals,
    mountains: isBlueTeam ? match.extraStats.mountains : match.extraStats.opp_mountains,
    clouds: isBlueTeam ? match.extraStats.clouds : match.extraStats.opp_clouds,
    oceans: isBlueTeam ? match.extraStats.oceans : match.extraStats.opp_oceans,
    chemtechs: isBlueTeam ? match.extraStats.chemtechs : match.extraStats.opp_chemtechs,
    hextechs: isBlueTeam ? match.extraStats.hextechs : match.extraStats.opp_hextechs,
    drakes_unknown: isBlueTeam ? match.extraStats.drakes_unknown : match.extraStats.opp_drakes_unknown,
    elders: isBlueTeam ? match.extraStats.elders : match.extraStats.opp_elders,
    
    // Herald and Baron stats
    heralds: isBlueTeam ? match.extraStats.heralds : match.extraStats.opp_heralds,
    barons: isBlueTeam ? match.extraStats.barons : match.extraStats.opp_barons,
    void_grubs: isBlueTeam ? match.extraStats.void_grubs : match.extraStats.opp_void_grubs,
    
    // Tower and inhibitor stats
    towers: isBlueTeam ? match.extraStats.towers : match.extraStats.opp_towers,
    turret_plates: isBlueTeam ? match.extraStats.turret_plates : match.extraStats.opp_turret_plates,
    inhibitors: isBlueTeam ? match.extraStats.inhibitors : match.extraStats.opp_inhibitors,
    
    // Add picks and bans if available
    picks: isBlueTeam && match.extraStats.picks?.blue 
      ? match.extraStats.picks.blue 
      : !isBlueTeam && match.extraStats.picks?.red 
      ? match.extraStats.picks.red 
      : undefined,
      
    bans: isBlueTeam && match.extraStats.bans?.blue 
      ? match.extraStats.bans.blue 
      : !isBlueTeam && match.extraStats.bans?.red 
      ? match.extraStats.bans.red 
      : undefined,
  };

  return teamStats;
}

/**
 * Process first objective stats from match data
 * @param match The match object
 * @param objectiveKey The key of the objective
 * @param teamId The ID of the team to check
 * @returns true if team got the objective first, false otherwise, undefined if data not available
 */
function processFirstObjective(match: Match, objectiveKey: string, teamId: string): boolean | undefined {
  if (!match.extraStats) return undefined;
  
  // Check if the objective exists in extraStats
  if (typeof match.extraStats[objectiveKey] === 'undefined') {
    return undefined;
  }
  
  // If the value is boolean, we can't determine which team got it first
  if (typeof match.extraStats[objectiveKey] === 'boolean') {
    return undefined;
  }
  
  // Check if the value matches the team ID (string comparison)
  if (match.extraStats[objectiveKey] === teamId) {
    return true;
  }
  
  // Check if the team's name matches
  if (match.teamBlue?.id === teamId && match.extraStats[objectiveKey] === 'blue') {
    return true;
  }
  
  if (match.teamRed?.id === teamId && match.extraStats[objectiveKey] === 'red') {
    return true;
  }
  
  // If there's a value but it doesn't match this team, return false
  return match.extraStats[objectiveKey] ? false : undefined;
}
