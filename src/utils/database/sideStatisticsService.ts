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

    let blueWins = 0;
    let redWins = 0;
    let blueFirstBlood = 0;
    let redFirstBlood = 0;
    let blueFirstDragon = 0;
    let redFirstHerald = 0;
    let blueFirstTower = 0;
    let redFirstTower = 0;
    let blueFirstBaron = 0;
    let redFirstBaron = 0;

    // Process each match
    matches.forEach(match => {
      // Determine if the team played on blue or red side
      const isBlue = match.team1_id === teamId;
      const isRed = match.team2_id === teamId;

      if (!isBlue && !isRed) return;

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

      // Process first herald (if available)
      if (match.firstherald_team_id) {
        const hasFirstHerald = match.firstherald_team_id === teamId;
        if (isBlue && hasFirstHerald) blueFirstHerald++;
        if (isRed && hasFirstHerald) redFirstHerald++;
      }

      // Process first tower
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

    // Calculate total matches on each side
    const blueSideMatches = matches.filter(m => m.team1_id === teamId).length;
    const redSideMatches = matches.filter(m => m.team2_id === teamId).length;

    return {
      teamId: teamId,
      blueWins: blueWins,
      redWins: redWins,
      blueFirstBlood: blueFirstBlood,
      redFirstBlood: redFirstBlood,
      blueFirstDragon: blueFirstDragon,
      redFirstDragon: redFirstDragon,
      blueFirstHerald: blueFirstHerald,
      redFirstHerald: redFirstHerald,
      blueFirstTower: blueFirstTower,
      redFirstTower: redFirstTower,
      blueFirstBaron: blueFirstBaron,
      redFirstBaron: redFirstBaron
    };
  } catch (error) {
    console.error("Error fetching side statistics:", error);
    toast.error("Failed to load side statistics");
    return null;
  }
};
