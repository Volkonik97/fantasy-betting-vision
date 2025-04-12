
import { supabase } from '@/integrations/supabase/client';
import { SideStatistics } from '@/utils/models/types';
import { toast } from 'sonner';

/**
 * Get side-based statistics for a specific team
 */
export const getSideStatistics = async (teamId: string): Promise<SideStatistics | null> => {
  try {
    if (!teamId) {
      console.error("No team ID provided");
      return null;
    }

    // Using a more defensive approach to avoid type issues
    const { data: matchesData, error: matchesError } = await supabase
      .from('matches')
      .select('*')
      .or(`team1_id.eq.${teamId},team2_id.eq.${teamId}`);

    if (matchesError) {
      console.error("Error fetching matches:", matchesError);
      toast.error("Failed to load matches");
      return null;
    }

    const matches = matchesData || [];

    // Initialize statistics
    let blueWins = 0;
    let redWins = 0;
    let blueFirstBlood = 0;
    let redFirstBlood = 0;
    let blueFirstDragon = 0;
    let redFirstDragon = 0;
    let blueFirstHerald = 0;
    let redFirstHerald = 0;
    let blueFirstTower = 0;
    let redFirstTower = 0;
    let blueFirstBaron = 0;
    let redFirstBaron = 0;

    // Count blue/red side matches
    let blueSideMatches = 0;
    let redSideMatches = 0;

    // Process each match
    matches.forEach(match => {
      // Determine if the team played on blue or red side
      const isBlue = match.team1_id === teamId;
      const isRed = match.team2_id === teamId;

      if (!isBlue && !isRed) return;

      // Increment side counters
      if (isBlue) blueSideMatches++;
      if (isRed) redSideMatches++;

      // Check winner
      const isWinner = match.winner_team_id === teamId;

      if (isBlue && isWinner) blueWins++;
      if (isRed && isWinner) redWins++;

      // Process first blood
      const hasFirstBlood = match.firstblood_team_id === teamId;
      if (isBlue && hasFirstBlood) blueFirstBlood++;
      if (isRed && hasFirstBlood) redFirstBlood++;

      // Process first dragon
      const hasFirstDragon = match.firstdragon_team_id === teamId;
      if (isBlue && hasFirstDragon) blueFirstDragon++;
      if (isRed && hasFirstDragon) redFirstDragon++;

      // Process first tower (if available)
      const hasFirstTower = match.firsttower_team_id === teamId;
      if (isBlue && hasFirstTower) blueFirstTower++;
      if (isRed && hasFirstTower) redFirstTower++;

      // Process first baron (if available)
      if (match.firstbaron_team_id) {
        const hasFirstBaron = match.firstbaron_team_id === teamId;
        if (isBlue && hasFirstBaron) blueFirstBaron++;
        if (isRed && hasFirstBaron) redFirstBaron++;
      }
    });

    // Create the result object with safe division
    return {
      teamId: teamId,
      blueWins: blueSideMatches > 0 ? Math.round((blueWins / blueSideMatches) * 100) : 0,
      redWins: redSideMatches > 0 ? Math.round((redWins / redSideMatches) * 100) : 0,
      blueFirstBlood: blueSideMatches > 0 ? Math.round((blueFirstBlood / blueSideMatches) * 100) : 0,
      redFirstBlood: redSideMatches > 0 ? Math.round((redFirstBlood / redSideMatches) * 100) : 0,
      blueFirstDragon: blueSideMatches > 0 ? Math.round((blueFirstDragon / blueSideMatches) * 100) : 0, 
      redFirstDragon: redSideMatches > 0 ? Math.round((redFirstDragon / redSideMatches) * 100) : 0,
      blueFirstHerald: blueSideMatches > 0 ? Math.round((blueFirstHerald / blueSideMatches) * 100) : 0,
      redFirstHerald: redSideMatches > 0 ? Math.round((redFirstHerald / redSideMatches) * 100) : 0,
      blueFirstTower: blueSideMatches > 0 ? Math.round((blueFirstTower / blueSideMatches) * 100) : 0,
      redFirstTower: redSideMatches > 0 ? Math.round((redFirstTower / redSideMatches) * 100) : 0,
      blueFirstBaron: blueSideMatches > 0 ? Math.round((blueFirstBaron / blueSideMatches) * 100) : 0,
      redFirstBaron: redSideMatches > 0 ? Math.round((redFirstBaron / redSideMatches) * 100) : 0
    };
  } catch (error) {
    console.error("Error fetching side statistics:", error);
    toast.error("Failed to load side statistics");
    return null;
  }
};
