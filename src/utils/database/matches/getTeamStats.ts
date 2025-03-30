
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Récupère les statistiques d'une équipe pour un match spécifique
 * @param matchId ID du match
 * @param teamId ID de l'équipe
 * @returns Statistiques de l'équipe pour ce match, ou null si non trouvées
 */
export async function getTeamMatchStats(matchId: string, teamId: string) {
  try {
    const { data, error } = await supabase
      .from('team_match_stats')
      .select('*')
      .eq('match_id', matchId)
      .eq('team_id', teamId)
      .single();
    
    if (error) {
      console.error('Erreur lors de la récupération des statistiques d\'équipe:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques d\'équipe:', error);
    return null;
  }
}

/**
 * Récupère toutes les statistiques d'une équipe
 * @param teamId ID de l'équipe
 * @returns Liste des statistiques de l'équipe pour tous ses matchs
 */
export async function getAllTeamMatchStats(teamId: string) {
  try {
    const { data, error } = await supabase
      .from('team_match_stats')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(`Erreur lors de la récupération des statistiques pour l'équipe ${teamId}:`, error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error(`Erreur lors de la récupération des statistiques pour l'équipe ${teamId}:`, error);
    return [];
  }
}

/**
 * Récupère les statistiques des deux équipes pour un match spécifique
 * @param matchId ID du match
 * @returns Statistiques des deux équipes pour ce match
 */
export async function getMatchTeamStats(matchId: string) {
  try {
    const { data, error } = await supabase
      .from('team_match_stats')
      .select('*')
      .eq('match_id', matchId);
    
    if (error) {
      console.error(`Erreur lors de la récupération des statistiques pour le match ${matchId}:`, error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error(`Erreur lors de la récupération des statistiques pour le match ${matchId}:`, error);
    return [];
  }
}
