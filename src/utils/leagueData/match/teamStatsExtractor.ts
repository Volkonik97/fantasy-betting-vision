
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
    
    console.log(`Extracting team stats for team ${teamId} in game ${gameId}`);
    
    // Log sample data to verify values
    if (rows.length > 0) {
      console.log(`Sample row data for team ${teamId}:`, {
        dragons: baseRow.dragons,
        barons: baseRow.barons,
        firstblood: baseRow.firstblood,
        firstdragon: baseRow.firstdragon,
        firstbaron: baseRow.firstbaron
      });
    }
    
    // Determine if this team got first objectives
    const hasFirstBlood = checkBooleanValue(baseRow.firstblood);
    const hasFirstDragon = checkBooleanValue(baseRow.firstdragon);
    const hasFirstHerald = checkBooleanValue(baseRow.firstherald);
    const hasFirstBaron = checkBooleanValue(baseRow.firstbaron);
    const hasFirstTower = checkBooleanValue(baseRow.firsttower);
    const hasFirstMidTower = checkBooleanValue(baseRow.firstmidtower);
    const hasFirstThreeTowers = checkBooleanValue(baseRow.firsttothreetowers);
    
    // Parse numeric values with safeParse helpers
    const dragons = safeParseInt(baseRow.dragons);
    const oppDragons = safeParseInt(baseRow.opp_dragons);
    const elementalDrakes = safeParseInt(baseRow.elementaldrakes);
    const oppElementalDrakes = safeParseInt(baseRow.opp_elementaldrakes);
    const infernals = safeParseInt(baseRow.infernals);
    const mountains = safeParseInt(baseRow.mountains);
    const clouds = safeParseInt(baseRow.clouds);
    const oceans = safeParseInt(baseRow.oceans);
    const chemtechs = safeParseInt(baseRow.chemtechs);
    const hextechs = safeParseInt(baseRow.hextechs);
    const drakesUnknown = safeParseInt(baseRow['dragons (type unknown)']);
    const elders = safeParseInt(baseRow.elders);
    const oppElders = safeParseInt(baseRow.opp_elders);
    const heralds = safeParseInt(baseRow.heralds);
    const oppHeralds = safeParseInt(baseRow.opp_heralds);
    const voidGrubs = safeParseInt(baseRow.void_grubs);
    const oppVoidGrubs = safeParseInt(baseRow.opp_void_grubs);
    const barons = safeParseInt(baseRow.barons);
    const oppBarons = safeParseInt(baseRow.opp_barons);
    const towers = safeParseInt(baseRow.towers);
    const oppTowers = safeParseInt(baseRow.opp_towers);
    const turretPlates = safeParseInt(baseRow.turretplates);
    const oppTurretPlates = safeParseInt(baseRow.opp_turretplates);
    const inhibitors = safeParseInt(baseRow.inhibitors);
    const oppInhibitors = safeParseInt(baseRow.opp_inhibitors);
    const teamKills = safeParseInt(baseRow.teamkills);
    const teamDeaths = safeParseInt(baseRow.teamdeaths);
    const teamKpm = safeParseFloat(baseRow['team kpm']);
    const ckpm = safeParseFloat(baseRow.ckpm);
    
    teamStatsMap.set(teamId, {
      team_id: teamId,
      match_id: gameId,
      side: baseRow.side || '',
      is_winner: baseRow.result === '1',
      team_kpm: teamKpm,
      ckpm: ckpm,
      first_blood: hasFirstBlood ? teamId : null,
      team_kills: teamKills,
      team_deaths: teamDeaths,
      first_dragon: hasFirstDragon ? teamId : null,
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
      first_herald: hasFirstHerald ? teamId : null,
      heralds: heralds,
      opp_heralds: oppHeralds,
      first_baron: hasFirstBaron ? teamId : null,
      barons: barons,
      opp_barons: oppBarons,
      void_grubs: voidGrubs,
      opp_void_grubs: oppVoidGrubs,
      first_tower: hasFirstTower ? teamId : null,
      first_mid_tower: hasFirstMidTower ? teamId : null,
      first_three_towers: hasFirstThreeTowers ? teamId : null,
      towers: towers,
      opp_towers: oppTowers,
      turret_plates: turretPlates,
      opp_turret_plates: oppTurretPlates,
      inhibitors: inhibitors,
      opp_inhibitors: oppInhibitors
    });
    
    console.log(`Team ${teamId} stats extracted:`, {
      dragons: dragons,
      barons: barons,
      firstBlood: hasFirstBlood ? teamId : null,
      firstDragon: hasFirstDragon ? teamId : null
    });
  });
  
  return teamStatsMap;
}

/**
 * Helper function to check if a value represents a boolean true
 */
function checkBooleanValue(value: string | undefined): boolean {
  if (!value) return false;
  return value === '1' || value.toLowerCase() === 'true';
}
