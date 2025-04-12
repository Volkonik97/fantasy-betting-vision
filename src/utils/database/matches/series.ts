
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Vérifie si un ID de match correspond à une partie d'une série
 */
export const isSeriesMatch = (matchId: string): boolean => {
  return matchId.includes('_');
};

/**
 * Extrait le numéro de jeu à partir de l'ID du match
 */
export const getGameNumberFromId = (matchId: string): number => {
  if (!isSeriesMatch(matchId)) return 1;
  
  const parts = matchId.split('_');
  const lastPart = parts[parts.length - 1];
  
  if (lastPart && /^\d+$/.test(lastPart)) {
    return parseInt(lastPart, 10);
  }
  
  return 1;
};

/**
 * Obtient l'ID de base d'un match (sans le numéro de jeu)
 */
export const getBaseMatchId = (matchId: string): string => {
  if (!isSeriesMatch(matchId)) return matchId;
  
  const parts = matchId.split('_');
  // Si le dernier élément est un nombre, le supprimer
  const lastPart = parts[parts.length - 1];
  
  if (lastPart && /^\d+$/.test(lastPart)) {
    parts.pop();
  }
  
  return parts.join('_');
};

/**
 * Vérifie si un match fait partie d'une série standard (BO3, BO5)
 */
export const isStandardSeries = async (matchId: string): Promise<boolean> => {
  if (!isSeriesMatch(matchId)) return false;
  
  const baseId = getBaseMatchId(matchId);
  
  try {
    // Récupérer tous les matchs de la série
    const { data, error } = await supabase
      .from('matches')
      .select('id')
      .like('id', `${baseId}_%`);
    
    if (error) {
      console.error("Erreur lors de la vérification de la série:", error);
      return false;
    }
    
    // Une série standard a au moins 2 matchs, généralement 3 (BO3) ou 5 (BO5)
    return data && data.length >= 2 && data.length <= 7;
  } catch (error) {
    console.error("Erreur lors de la vérification de la série:", error);
    return false;
  }
};

/**
 * Vérifie si une série a une longueur standard (BO3, BO5)
 */
export const isStandardSeriesLength = (seriesLength: number): boolean => {
  return seriesLength === 3 || seriesLength === 5 || seriesLength === 7;
};

/**
 * Détermine la longueur d'une série (BO3, BO5, etc.) 
 */
export const determineSeriesLength = async (baseMatchId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('id')
      .like('id', `${baseMatchId}_%`);
    
    if (error) {
      console.error("Erreur lors de la détermination de la longueur de la série:", error);
      return 1;
    }
    
    if (!data || data.length === 0) return 1;
    
    const matchCount = data.length;
    // BO3 = 3 matchs max, BO5 = 5 matchs max
    if (matchCount <= 3) return 3;
    if (matchCount <= 5) return 5;
    return 7; // BO7 ou plus
  } catch (error) {
    console.error("Erreur lors de la détermination de la longueur de la série:", error);
    return 1;
  }
};

/**
 * Récupère le score d'une série
 */
export const getSeriesScore = async (
  baseMatchId: string, 
  teamBlueId: string, 
  teamRedId: string, 
  returnSeriesLength = false
): Promise<{blue: number, red: number} | number> => {
  try {
    // Récupérer tous les matchs de la série
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .like('id', `${baseMatchId}_%`);
    
    if (error) {
      console.error("Erreur lors de la récupération du score de la série:", error);
      if (returnSeriesLength) return 1;
      return {blue: 0, red: 0};
    }
    
    if (!data || data.length === 0) {
      if (returnSeriesLength) return 1;
      return {blue: 0, red: 0};
    }
    
    if (returnSeriesLength) {
      // BO3 = 3 matchs max, BO5 = 5 matchs max
      const matchCount = data.length;
      if (matchCount <= 3) return 3;
      if (matchCount <= 5) return 5;
      return 7; // BO7 ou plus
    }
    
    return calculateSeriesScore(data, teamBlueId, teamRedId);
  } catch (error) {
    console.error("Erreur lors de la récupération du score de la série:", error);
    if (returnSeriesLength) return 1;
    return {blue: 0, red: 0};
  }
};

/**
 * Calcule le score d'une série à partir des données de match
 */
export const calculateSeriesScore = (
  matches: any[],
  teamBlueId?: string,
  teamRedId?: string
): {blue: number, red: number} => {
  const score = {blue: 0, red: 0};
  
  if (!matches || matches.length === 0) return score;
  
  // Si teamBlueId n'est pas fourni, utiliser le premier match pour le déterminer
  const firstMatch = matches[0];
  const actualTeamBlueId = teamBlueId || firstMatch.team_blue_id || firstMatch.team1_id;
  const actualTeamRedId = teamRedId || firstMatch.team_red_id || firstMatch.team2_id;
  
  // Calculer le score
  for (const match of matches) {
    if (!match.winner_team_id) continue;
    
    if (match.winner_team_id === actualTeamBlueId) {
      score.blue++;
    } else if (match.winner_team_id === actualTeamRedId) {
      score.red++;
    }
  }
  
  return score;
};

/**
 * Récupère tous les matchs d'une série
 */
export const fetchSeriesMatches = async (baseMatchId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .like('id', `${baseMatchId}_%`)
      .order('id');
    
    if (error) {
      console.error("Erreur lors de la récupération des matchs de la série:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des matchs de la série:", error);
    return [];
  }
};

/**
 * Récupère le score d'une série jusqu'à un certain jeu
 */
export const getSeriesScoreUpToGame = async (
  baseMatchId: string,
  gameNumber: number,
  teamBlueId: string,
  teamRedId: string
): Promise<{blue: number, red: number}> => {
  try {
    // Récupérer tous les matchs de la série jusqu'au jeu spécifié
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .like('id', `${baseMatchId}_%`);
    
    if (error) {
      console.error("Erreur lors de la récupération du score de la série:", error);
      return {blue: 0, red: 0};
    }
    
    if (!data || data.length === 0) {
      return {blue: 0, red: 0};
    }
    
    // Filtrer les matchs jusqu'au jeu spécifié (mais pas celui-ci)
    const filteredMatches = data.filter(match => {
      const currentGameNumber = getGameNumberFromId(match.id);
      return currentGameNumber < gameNumber;
    });
    
    return calculateSeriesScore(filteredMatches, teamBlueId, teamRedId);
  } catch (error) {
    console.error("Erreur lors de la récupération du score de la série:", error);
    return {blue: 0, red: 0};
  }
};
