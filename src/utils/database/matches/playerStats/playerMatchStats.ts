
import { supabase } from '@/integrations/supabase/client';
import { getWithCache } from './cache';

/**
 * Récupère les statistiques d'un joueur sur tous ses matchs
 * @param playerId ID du joueur
 * @returns Liste des statistiques du joueur pour tous ses matchs
 */
export async function getPlayerMatchStats(playerId: string) {
  try {
    return await getWithCache<any>(
      playerId,
      async () => {
        const { data, error } = await supabase
          .from('player_match_stats')
          .select('*')
          .eq('player_id', playerId);
        
        if (error) {
          console.error("Erreur lors de la récupération des statistiques du joueur:", error);
          return [];
        }
        
        return data || [];
      }
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques du joueur:", error);
    return [];
  }
}

/**
 * Alias for getPlayerMatchStats for backward compatibility
 * @param playerId ID du joueur
 * @returns Liste des statistiques du joueur pour tous ses matchs
 */
export const getPlayerStats = getPlayerMatchStats;

/**
 * Récupère les statistiques de joueurs pour une équipe spécifique
 * @param teamId ID de l'équipe
 * @returns Liste des statistiques des joueurs de l'équipe
 */
export async function getTeamPlayersStats(teamId: string) {
  try {
    const { data, error } = await supabase
      .from('player_match_stats')
      .select('*')
      .eq('team_id', teamId);
    
    if (error) {
      console.error("Erreur lors de la récupération des statistiques des joueurs de l'équipe:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques des joueurs de l'équipe:", error);
    return [];
  }
}
