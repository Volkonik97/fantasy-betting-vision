
import { Match } from '@/utils/models/types';

/**
 * Extract team-specific stats from a match object
 */
export function extractTeamSpecificStats(
  match: Match, 
  allMatches: Match[] = []
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

  // Based on the spreadsheet, it seems the data is organized in rows
  // where index 0 represents one team and index 1 represents the other
  
  // Extract dragon stats for blue team
  const blueTeamStats = {
    team_id: match.teamBlue.id,
    match_id: match.id,
    is_blue_side: true,
    dragons: safeParseInt(match.extraStats.dragons),
    infernals: safeParseInt(match.extraStats.infernals),
    mountains: safeParseInt(match.extraStats.mountains), 
    clouds: safeParseInt(match.extraStats.clouds),
    oceans: safeParseInt(match.extraStats.oceans),
    chemtechs: safeParseInt(match.extraStats.chemtechs),
    hextechs: safeParseInt(match.extraStats.hextechs),
    drakes_unknown: safeParseInt(match.extraStats.drakes_unknown),
    elemental_drakes: safeParseInt(match.extraStats.elemental_drakes),
    first_dragon: match.extraStats.first_dragon === match.teamBlue.id
  };

  // Extract dragon stats for red team
  const redTeamStats = {
    team_id: match.teamRed.id,
    match_id: match.id,
    is_blue_side: false,
    dragons: safeParseInt(match.extraStats.opp_dragons),
    // For the specific dragon types, we need to access the same properties
    // as we have no dedicated opp_ versions for these
    infernals: safeParseInt(match.extraStats.opp_infernals || 0),
    mountains: safeParseInt(match.extraStats.opp_mountains || 0),
    clouds: safeParseInt(match.extraStats.opp_clouds || 0),
    oceans: safeParseInt(match.extraStats.opp_oceans || 0),
    chemtechs: safeParseInt(match.extraStats.opp_chemtechs || 0),
    hextechs: safeParseInt(match.extraStats.opp_hextechs || 0),
    drakes_unknown: safeParseInt(match.extraStats.opp_drakes_unknown || 0),
    elemental_drakes: safeParseInt(match.extraStats.opp_elemental_drakes),
    first_dragon: match.extraStats.first_dragon === match.teamRed.id
  };

  return { blueTeamStats, redTeamStats };
}
