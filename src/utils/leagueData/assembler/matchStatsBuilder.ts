
import { processTeamRows } from './teamStatsProcessor';
import { LeagueGameDataRow } from '../../csv/types';

/**
 * Build team match stats array from processed match data
 */
export function buildTeamMatchStatsArray(
  matches: any[], 
  teams: any[], 
  matchStats: Map<string, Map<string, any>>,
  rowsByGameId: Map<string, LeagueGameDataRow[]>
): any[] {
  const teamMatchStatsArray: any[] = [];
  
  matches.forEach(match => {
    if (!match) return;
    
    const blueTeam = teams.find(t => t.id === match.teamBlue.id);
    const redTeam = teams.find(t => t.id === match.teamRed.id);
    
    if (!blueTeam || !redTeam) return;
    
    // Get game rows for this match
    const gameRows = rowsByGameId.get(match.id) || [];
    
    // Identify blue and red team rows
    const blueTeamRows = gameRows.filter(row => 
      row.side?.toLowerCase() === 'blue' || 
      row.teamposition?.toLowerCase() === 'blue'
    );
    
    const redTeamRows = gameRows.filter(row => 
      row.side?.toLowerCase() === 'red' || 
      row.teamposition?.toLowerCase() === 'red'
    );
    
    // Process blue team stats
    const blueTeamStats = processTeamRows(blueTeamRows, match.id, blueTeam.id, true);
    if (blueTeamStats) {
      // Add to team match stats array
      teamMatchStatsArray.push({
        ...blueTeamStats,
        match_id: match.id,
        team_id: blueTeam.id,
        side: 'blue'
      });
    }
    
    // Process red team stats
    const redTeamStats = processTeamRows(redTeamRows, match.id, redTeam.id, false);
    if (redTeamStats) {
      // Add to team match stats array
      teamMatchStatsArray.push({
        ...redTeamStats,
        match_id: match.id,
        team_id: redTeam.id,
        side: 'red'
      });
    }
    
    // Add team stats from matchStats if available
    const teamStatsMap = matchStats.get(match.id);
    
    if (teamStatsMap) {
      const existingBlueTeamStats = teamStatsMap.get(blueTeam.id);
      const existingRedTeamStats = teamStatsMap.get(redTeam.id);
      
      if (existingBlueTeamStats) {
        teamMatchStatsArray.push({
          ...existingBlueTeamStats,
          team_id: blueTeam.id,
          match_id: match.id,
          side: 'blue'
        });
      }
      
      if (existingRedTeamStats) {
        teamMatchStatsArray.push({
          ...existingRedTeamStats,
          team_id: redTeam.id,
          match_id: match.id,
          side: 'red'
        });
      }
    }
  });
  
  return teamMatchStatsArray;
}
