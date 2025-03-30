import { Match } from '@/utils/models/types';

/**
 * Extract team-specific stats from a match object
 */
export function extractTeamSpecificStats(
  match: Match, 
  allMatches: Match[] = [] // Full dataset to find the correct row for each team
): { blueTeamStats: any, redTeamStats: any } {
  
  if (!match.extraStats) {
    return { blueTeamStats: null, redTeamStats: null };
  }

  // Helper function to safely convert any value to an integer
  const safeParseInt = (value: any): number => {
    if (typeof value === 'number') return Math.floor(value);
    if (!value) return 0;
    const parsed = parseInt(String(value), 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  // 🔹 Find the row corresponding to the red team
  // We need to find a match where the blue team is our current red team
  const redTeamRow = allMatches.find(row => 
    row.teamBlue.id === match.teamRed.id || 
    row.teamRed.id === match.teamRed.id
  );

  if (!redTeamRow) {
    console.warn(`⚠️ Warning: No row found for red team ${match.teamRed.id}`);
  }

  // Extract dragon stats for each team
  const blueTeamStats = {
    team_id: match.teamBlue.id,
    match_id: match.id,
    is_blue_side: true,

    // 🔹 Blue team dragons (from match.extraStats)
    dragons: safeParseInt(match.extraStats.dragons),
    infernals: safeParseInt(match.extraStats.infernals),
    mountains: safeParseInt(match.extraStats.mountains), 
    clouds: safeParseInt(match.extraStats.clouds),
    oceans: safeParseInt(match.extraStats.oceans),
    chemtechs: safeParseInt(match.extraStats.chemtechs),
    hextechs: safeParseInt(match.extraStats.hextechs),
    drakes_unknown: safeParseInt(match.extraStats.drakes_unknown),
    elemental_drakes: safeParseInt(match.extraStats.elemental_drakes),

    // First objectives
    first_dragon: match.extraStats.first_dragon === match.teamBlue.id
  };

  // 🔹 Red team stats: Extract from its own row
  const redTeamStats = {
    team_id: match.teamRed.id,
    match_id: match.id,
    is_blue_side: false,

    // 🔹 Extract detailed dragon types from red team's own row
    dragons: safeParseInt(match.extraStats.opp_dragons),
    
    // If we found a matching row for the red team, use its data
    // Otherwise, we don't have detailed breakdown by drake type
    infernals: redTeamRow?.extraStats ? safeParseInt(redTeamRow.extraStats.infernals) : 0,
    mountains: redTeamRow?.extraStats ? safeParseInt(redTeamRow.extraStats.mountains) : 0,
    clouds: redTeamRow?.extraStats ? safeParseInt(redTeamRow.extraStats.clouds) : 0,
    oceans: redTeamRow?.extraStats ? safeParseInt(redTeamRow.extraStats.oceans) : 0,
    chemtechs: redTeamRow?.extraStats ? safeParseInt(redTeamRow.extraStats.chemtechs) : 0,
    hextechs: redTeamRow?.extraStats ? safeParseInt(redTeamRow.extraStats.hextechs) : 0,
    drakes_unknown: redTeamRow?.extraStats ? safeParseInt(redTeamRow.extraStats.drakes_unknown) : 0,
    elemental_drakes: safeParseInt(match.extraStats.opp_elemental_drakes || 0),

    // First objectives
    first_dragon: match.extraStats.first_dragon === match.teamRed.id
  };

  return { blueTeamStats, redTeamStats };
}
