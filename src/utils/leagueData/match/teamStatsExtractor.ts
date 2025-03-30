
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
  
  gameRows.forEach(row => {
    // Skip if not team data or already processed
    if (!row.teamid || teamStatsMap.has(row.teamid)) return;
    
    // Determine which team got the first blood/dragon/baron/etc.
    let firstBloodTeam = null;
    let firstDragonTeam = null;
    let firstHeraldTeam = null;
    let firstBaronTeam = null;
    let firstTowerTeam = null;
    
    // If row has firstblood=1, then this team got first blood
    if (row.firstblood === '1' || row.firstblood === 'TRUE' || row.firstblood === 'true') {
      firstBloodTeam = row.teamid;
    }
    
    // Similarly for other objectives
    if (row.firstdragon === '1' || row.firstdragon === 'TRUE' || row.firstdragon === 'true') {
      firstDragonTeam = row.teamid;
    }
    
    if (row.firstherald === '1' || row.firstherald === 'TRUE' || row.firstherald === 'true') {
      firstHeraldTeam = row.teamid;
    }
    
    if (row.firstbaron === '1' || row.firstbaron === 'TRUE' || row.firstbaron === 'true') {
      firstBaronTeam = row.teamid;
    }
    
    if (row.firsttower === '1' || row.firsttower === 'TRUE' || row.firsttower === 'true') {
      firstTowerTeam = row.teamid;
    }
    
    teamStatsMap.set(row.teamid, {
      team_id: row.teamid,
      match_id: gameId,
      side: row.side || '',
      is_winner: row.result === '1',
      team_kpm: safeParseFloat(row['team kpm']),
      ckpm: safeParseFloat(row.ckpm),
      first_blood: firstBloodTeam,
      team_kills: safeParseInt(row.teamkills),
      team_deaths: safeParseInt(row.teamdeaths),
      first_dragon: firstDragonTeam,
      dragons: safeParseInt(row.dragons),
      opp_dragons: safeParseInt(row.opp_dragons),
      elemental_drakes: safeParseInt(row.elementaldrakes),
      opp_elemental_drakes: safeParseInt(row.opp_elementaldrakes),
      infernals: safeParseInt(row.infernals),
      mountains: safeParseInt(row.mountains),
      clouds: safeParseInt(row.clouds),
      oceans: safeParseInt(row.oceans),
      chemtechs: safeParseInt(row.chemtechs),
      hextechs: safeParseInt(row.hextechs),
      drakes_unknown: safeParseInt(row['dragons (type unknown)']),
      elders: safeParseInt(row.elders),
      opp_elders: safeParseInt(row.opp_elders),
      first_herald: firstHeraldTeam,
      heralds: safeParseInt(row.heralds),
      opp_heralds: safeParseInt(row.opp_heralds),
      first_baron: firstBaronTeam,
      barons: safeParseInt(row.barons),
      opp_barons: safeParseInt(row.opp_barons),
      void_grubs: safeParseInt(row.void_grubs),
      opp_void_grubs: safeParseInt(row.opp_void_grubs),
      first_tower: firstTowerTeam,
      first_mid_tower: row.firstmidtower === '1' ? row.teamid : null,
      first_three_towers: row.firsttothreetowers === '1' ? row.teamid : null,
      towers: safeParseInt(row.towers),
      opp_towers: safeParseInt(row.opp_towers),
      turret_plates: safeParseInt(row.turretplates),
      opp_turret_plates: safeParseInt(row.opp_turretplates),
      inhibitors: safeParseInt(row.inhibitors),
      opp_inhibitors: safeParseInt(row.opp_inhibitors)
    });
  });
  
  return teamStatsMap;
}
