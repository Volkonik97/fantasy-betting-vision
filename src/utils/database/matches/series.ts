
import { supabase } from "@/integrations/supabase/client";
import { Match } from "../../models/types";

/**
 * Vérifie si un match fait partie d'une série (basé sur l'ID)
 */
export const isSeriesMatch = (matchId: string): boolean => {
  return matchId.includes('_');
};

/**
 * Extrait le numéro de jeu d'un ID de match de série 
 */
export const getGameNumberFromId = (matchId: string): number | null => {
  if (!isSeriesMatch(matchId)) return null;
  
  const parts = matchId.split('_');
  const gameNumberStr = parts[parts.length - 1];
  const gameNumber = parseInt(gameNumberStr);
  
  return isNaN(gameNumber) ? null : gameNumber;
};

/**
 * Obtient l'ID de base d'une série (sans le numéro de jeu)
 */
export const getBaseMatchId = (matchId: string): string => {
  if (!isSeriesMatch(matchId)) return matchId;
  
  const parts = matchId.split('_');
  return parts.slice(0, -1).join('_');
};

/**
 * Détermine la longueur standard d'une série (3 ou 5 jeux)
 */
export const determineSeriesLength = (matchIds: string[]): number => {
  // La plupart des séries sont des Best-of-3 ou Best-of-5
  return matchIds.length > 3 ? 5 : 3;
};

/**
 * Vérifie si une série est de longueur standard (BO3 ou BO5)
 */
export const isStandardSeriesLength = (matchIds: string[]): boolean => {
  return matchIds.length === 3 || matchIds.length === 5;
};

/**
 * Vérifie si une série suit le format standard (numéros de jeu consécutifs)
 */
export const isStandardSeries = (matchIds: string[]): boolean => {
  if (!isStandardSeriesLength(matchIds)) return false;
  
  // Extraire tous les numéros de jeu
  const gameNumbers = matchIds
    .map(id => getGameNumberFromId(id))
    .filter(num => num !== null) as number[];
  
  // Vérifier si tous les numéros de jeu sont consécutifs
  return gameNumbers.length === matchIds.length && 
         gameNumbers.every((num, idx) => num === idx + 1);
};

/**
 * Calcule le score de la série à partir des matchs
 */
export const calculateSeriesScore = (matches: Match[]): [number, number] => {
  let blueTeamWins = 0;
  let redTeamWins = 0;
  
  matches.forEach(match => {
    if (match.result && match.result.winner) {
      if (match.result.winner === match.teamBlue.id) {
        blueTeamWins++;
      } else if (match.result.winner === match.teamRed.id) {
        redTeamWins++;
      }
    }
  });
  
  return [blueTeamWins, redTeamWins];
};

/**
 * Récupère le score d'une série
 */
export const getSeriesScore = async (baseMatchId: string): Promise<[number, number]> => {
  try {
    // Récupérer tous les matchs de la série
    const matches = await fetchSeriesMatches(baseMatchId);
    return calculateSeriesScore(matches);
  } catch (error) {
    console.error(`Erreur lors du calcul du score de la série ${baseMatchId}:`, error);
    return [0, 0];
  }
};

/**
 * Récupère le score d'une série jusqu'à un certain jeu
 */
export const getSeriesScoreUpToGame = async (
  baseMatchId: string,
  gameNumber: number
): Promise<[number, number]> => {
  try {
    // Récupérer tous les matchs de la série
    let matches = await fetchSeriesMatches(baseMatchId);
    
    // Filtrer les matchs jusqu'au jeu spécifié
    matches = matches.filter(match => {
      const thisGameNumber = getGameNumberFromId(match.id);
      return thisGameNumber !== null && thisGameNumber <= gameNumber;
    });
    
    return calculateSeriesScore(matches);
  } catch (error) {
    console.error(`Erreur lors du calcul du score de la série ${baseMatchId} jusqu'au jeu ${gameNumber}:`, error);
    return [0, 0];
  }
};

/**
 * Récupère tous les matchs d'une série
 */
export const fetchSeriesMatches = async (baseMatchId: string): Promise<Match[]> => {
  try {
    // Comme baseMatchId peut être soit l'ID complet d'un match de la série, soit l'ID de base (sans numéro de jeu)
    const actualBaseId = getBaseMatchId(baseMatchId);
    
    // Construire un pattern pour rechercher tous les matchs de la série
    const pattern = `${actualBaseId}_%`;
    
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .like('id', pattern)
      .order('id');
    
    if (error) {
      console.error(`Erreur lors de la récupération des matchs de la série ${actualBaseId}:`, error);
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log(`Aucun match trouvé pour la série ${actualBaseId}`);
      return [];
    }
    
    // Convertir les données Supabase en format Match
    return data.map(match => {
      return {
        id: match.gameid || match.id,
        tournament: match.tournament || '',
        date: match.date || '',
        teamBlue: {
          id: match.team_blue_id || match.team1_id || '',
          name: match.team_blue_name || match.team1_name || 'Équipe Bleue',
          region: match.team_blue_region || 'Unknown',
          logo: '',
          winRate: 0,
          blueWinRate: 0,
          redWinRate: 0,
          averageGameTime: 0
        },
        teamRed: {
          id: match.team_red_id || match.team2_id || '',
          name: match.team_red_name || match.team2_name || 'Équipe Rouge',
          region: match.team_red_region || 'Unknown',
          logo: '',
          winRate: 0,
          blueWinRate: 0,
          redWinRate: 0,
          averageGameTime: 0
        },
        status: match.status || 'Completed',
        predictedWinner: match.predicted_winner || '',
        blueWinOdds: match.blue_win_odds || 0.5,
        redWinOdds: match.red_win_odds || 0.5,
        result: {
          winner: match.winner_team_id || '',
          score: [match.score_blue || 0, match.score_red || 0],
          duration: match.duration || match.gamelength?.toString() || '0',
          mvp: match.mvp || ''
        },
        extraStats: {
          patch: match.patch || '',
          gameNumber: match.game_number || getGameNumberFromId(match.id || '')
        }
      };
    });
  } catch (error) {
    console.error(`Erreur lors de la récupération des matchs de la série ${baseMatchId}:`, error);
    return [];
  }
};
