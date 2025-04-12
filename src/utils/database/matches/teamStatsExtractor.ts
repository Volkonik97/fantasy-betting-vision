
/**
 * Extracts team-specific statistics from a match
 */
export const extractTeamSpecificStats = (match: any, teamId: string): any => {
  if (!match || !teamId) {
    console.error("Missing match or team ID for extractTeamSpecificStats");
    return null;
  }
  
  // Determine if team is blue or red side
  const isBlueTeam = 
    match.team_blue_id === teamId || 
    match.team1_id === teamId;
    
  // Get team name
  const teamName = isBlueTeam 
    ? (match.team_blue_name || match.team1_name)
    : (match.team_red_name || match.team2_name);
    
  // Get opponent ID and name
  const opponentId = isBlueTeam 
    ? (match.team_red_id || match.team2_id)
    : (match.team_blue_id || match.team1_id);
    
  const opponentName = isBlueTeam 
    ? (match.team_red_name || match.team2_name)
    : (match.team_blue_name || match.team1_name);
    
  // Determine winner
  const isWinner = match.winner_team_id === teamId;
  
  // Get score
  const teamScore = isBlueTeam ? match.score_blue : match.score_red;
  const opponentScore = isBlueTeam ? match.score_red : match.score_blue;
  
  // Handle objectives based on which team it is
  const firstBlood = match.first_blood === teamId || match.firstblood_team_id === teamId;
  const firstDragon = match.first_dragon === teamId || match.firstdragon_team_id === teamId;
  const firstHerald = match.first_herald === teamId || match.firstherald_team_id === teamId;
  const firstBaron = match.first_baron === teamId || match.firstbaron_team_id === teamId;
  const firstTower = match.first_tower === teamId || match.firsttower_team_id === teamId;
  
  return {
    match_id: match.id || match.gameid,
    team_id: teamId,
    team_name: teamName,
    opponent_id: opponentId,
    opponent_name: opponentName,
    is_blue_side: isBlueTeam,
    is_winner: isWinner,
    score: [teamScore, opponentScore],
    tournament: match.tournament,
    date: match.date,
    patch: match.patch,
    duration: match.duration || match.gamelength,
    first_blood: firstBlood,
    first_dragon: firstDragon,
    first_herald: firstHerald,
    first_baron: firstBaron,
    first_tower: firstTower
  };
};
