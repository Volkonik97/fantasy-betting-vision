
import { supabase } from "@/integrations/supabase/client";
import { Match } from '../mockData';
import { chunk } from '../dataConverter';
import { getLoadedMatches, setLoadedMatches } from '../csvTypes';
import { getTeams } from './teamsService';

// Save matches to database
export const saveMatches = async (matches: Match[]): Promise<boolean> => {
  try {
    // Insérer les matchs par lots de 100
    const matchChunks = chunk(matches, 100);
    for (const matchChunk of matchChunks) {
      const { error: matchesError } = await supabase.from('matches').insert(
        matchChunk.map(match => ({
          id: match.id,
          tournament: match.tournament,
          date: match.date,
          team_blue_id: match.teamBlue.id,
          team_red_id: match.teamRed.id,
          predicted_winner: match.predictedWinner,
          blue_win_odds: match.blueWinOdds,
          red_win_odds: match.redWinOdds,
          status: match.status,
          winner_team_id: match.result?.winner,
          score_blue: match.result?.score ? match.result.score[0] : null,
          score_red: match.result?.score ? match.result.score[1] : null,
          duration: match.result?.duration,
          mvp: match.result?.mvp,
          first_blood: match.result?.firstBlood,
          first_dragon: match.result?.firstDragon,
          first_baron: match.result?.firstBaron
        }))
      );
      
      if (matchesError) {
        console.error("Erreur lors de l'insertion des matchs:", matchesError);
        return false;
      }
    }
    
    console.log("Matchs insérés avec succès");
    return true;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des matchs:", error);
    return false;
  }
};

// Get matches from database
export const getMatches = async (): Promise<Match[]> => {
  const loadedMatches = getLoadedMatches();
  if (loadedMatches) return loadedMatches;
  
  try {
    const { data: matchesData, error: matchesError } = await supabase
      .from('matches')
      .select('*');
    
    if (matchesError || !matchesData || matchesData.length === 0) {
      console.error("Erreur lors de la récupération des matchs:", matchesError);
      const { matches } = await import('../mockData');
      return matches;
    }
    
    const teams = await getTeams();
    
    const matches: Match[] = matchesData.map(match => {
      const teamBlue = teams.find(t => t.id === match.team_blue_id) || teams[0];
      const teamRed = teams.find(t => t.id === match.team_red_id) || teams[1];
      
      const matchObject: Match = {
        id: match.id as string,
        tournament: match.tournament as string,
        date: match.date as string,
        teamBlue,
        teamRed,
        predictedWinner: match.predicted_winner as string,
        blueWinOdds: Number(match.blue_win_odds) || 0.5,
        redWinOdds: Number(match.red_win_odds) || 0.5,
        status: (match.status || 'Upcoming') as 'Upcoming' | 'Live' | 'Completed'
      };
      
      if (match.status === 'Completed' && match.winner_team_id) {
        matchObject.result = {
          winner: match.winner_team_id as string,
          score: [Number(match.score_blue) || 0, Number(match.score_red) || 0],
          duration: match.duration as string | undefined,
          mvp: match.mvp as string | undefined,
          firstBlood: match.first_blood as string | undefined,
          firstDragon: match.first_dragon as string | undefined,
          firstBaron: match.first_baron as string | undefined
        };
      }
      
      return matchObject;
    });
    
    setLoadedMatches(matches);
    return matches;
  } catch (error) {
    console.error("Erreur lors de la récupération des matchs:", error);
    const { matches } = await import('../mockData');
    return matches;
  }
};
