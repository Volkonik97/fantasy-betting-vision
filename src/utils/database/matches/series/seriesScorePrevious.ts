
// Utility function to determine the series score up to a given game
// This is useful for displaying the score in the UI for ongoing series

/**
 * Determines the series score up to a given game in a series of matches.
 * @param matches An array of match objects representing the series.
 * @param currentGameId The ID of the current game for which to determine the score.
 * @returns An array containing the scores for team1 and team2, respectively.
 */
const getSeriesScoreUpToGame = (matches: any[], currentGameId: string): [number, number] => {
  if (!matches || matches.length === 0) {
    return [0, 0];
  }

  // Extract team IDs from the first match safely
  const team1Id = matches[0]?.team1_id;
  const team2Id = matches[0]?.team2_id;

  if (!team1Id || !team2Id) {
    console.warn("Team IDs not found in match data");
    return [0, 0];
  }

  // Sort matches by game number or date to ensure correct order
  const sortedMatches = [...matches].sort((a, b) => {
    // Try sorting by game_number first
    if (a.game_number !== undefined && b.game_number !== undefined) {
      return Number(a.game_number) - Number(b.game_number);
    }

    // If game_number is not available, sort by date
    const dateA = new Date(a.date || 0).getTime();
    const dateB = new Date(b.date || 0).getTime();
    return dateA - dateB;
  });

  let team1Score = 0;
  let team2Score = 0;

  for (const match of sortedMatches) {
    // Stop counting when we reach the current game
    if (match.gameid === currentGameId) {
      break;
    }

    // Safely access winner_team_id with fallback
    const winnerId = match.winner_team_id;

    if (winnerId === team1Id) {
      team1Score++;
    } else if (winnerId === team2Id) {
      team2Score++;
    }
  }

  return [team1Score, team2Score];
};

export { getSeriesScoreUpToGame };
