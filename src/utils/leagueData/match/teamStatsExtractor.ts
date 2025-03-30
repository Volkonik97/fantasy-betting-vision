
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
    
    // Log sample data to verify values
    if (rows.length > 0) {
      console.log(`Données d'échantillon pour l'équipe ${teamId}:`, {
        dragons: baseRow.dragons,
        barons: baseRow.barons,
        firstblood: baseRow.firstblood,
        firstdragon: baseRow.firstdragon,
        firstbaron: baseRow.firstbaron,
        gameLength: baseRow.gamelength,
        teamKpm: baseRow['team kpm'],
        ckpm: baseRow.ckpm
      });
    }
    
    // Determine if this team got first objectives
    const hasFirstBlood = checkTeamObjectiveValue(baseRow.firstblood, teamId);
    const hasFirstDragon = checkTeamObjectiveValue(baseRow.firstdragon, teamId);
    const hasFirstHerald = checkTeamObjectiveValue(baseRow.firstherald, teamId);
    const hasFirstBaron = checkTeamObjectiveValue(baseRow.firstbaron, teamId);
    const hasFirstTower = checkTeamObjectiveValue(baseRow.firsttower, teamId);
    const hasFirstMidTower = checkTeamObjectiveValue(baseRow.firstmidtower, teamId);
    const hasFirstThreeTowers = checkTeamObjectiveValue(baseRow.firsttothreetowers, teamId);
    
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
