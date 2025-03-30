
import { supabase } from '@/integrations/supabase/client';

/**
 * Récupère les statistiques d'un joueur sur tous ses matchs
 * @param playerId ID du joueur
 * @returns Liste des statistiques du joueur pour tous ses matchs
 */
export async function getPlayerMatchStats(playerId: string) {
  try {
    const { data, error } = await supabase
      .from('player_match_stats')
      .select('*')
      .eq('player_id', playerId);
    
    if (error) {
      console.error("Erreur lors de la récupération des statistiques du joueur:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques du joueur:", error);
    return [];
  }
}

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

/**
 * Génère des statistiques de timeline pour une équipe à partir des statistiques de ses joueurs
 * @param teamId ID de l'équipe
 * @returns Statistiques de timeline agrégées
 */
export async function getTeamTimelineStats(teamId: string) {
  try {
    console.log(`Récupération des statistiques timeline pour l'équipe ${teamId}`);
    
    // Récupérer toutes les statistiques des joueurs de l'équipe
    const playerStats = await getTeamPlayersStats(teamId);
    
    if (!playerStats || playerStats.length === 0) {
      console.log(`Aucune statistique de joueur trouvée pour l'équipe ${teamId}`);
      return null;
    }
    
    console.log(`Trouvé ${playerStats.length} statistiques de joueurs pour l'équipe ${teamId}`);
    
    // Points de temps pour l'analyse
    const timePoints = ['10', '15', '20', '25'];
    const result: any = {};
    
    // Pour chaque point de temps, calculer les moyennes
    timePoints.forEach(time => {
      // Préparer les clés pour accéder aux données
      const goldKey = `gold_at_${time}`;
      const xpKey = `xp_at_${time}`;
      const csKey = `cs_at_${time}`;
      const goldDiffKey = `gold_diff_at_${time}`;
      const csDiffKey = `cs_diff_at_${time}`;
      const killsKey = `kills_at_${time}`;
      const deathsKey = `deaths_at_${time}`;
      const assistsKey = `assists_at_${time}`;
      
      // Récupérer les données valides pour chaque métrique
      const goldValues = playerStats
        .filter(s => s[goldKey] !== null && s[goldKey] !== undefined)
        .map(s => s[goldKey]);
        
      const xpValues = playerStats
        .filter(s => s[xpKey] !== null && s[xpKey] !== undefined)
        .map(s => s[xpKey]);
        
      const csValues = playerStats
        .filter(s => s[csKey] !== null && s[csKey] !== undefined)
        .map(s => s[csKey]);
        
      const goldDiffValues = playerStats
        .filter(s => s[goldDiffKey] !== null && s[goldDiffKey] !== undefined)
        .map(s => s[goldDiffKey]);
        
      const csDiffValues = playerStats
        .filter(s => s[csDiffKey] !== null && s[csDiffKey] !== undefined)
        .map(s => s[csDiffKey]);
        
      const killsValues = playerStats
        .filter(s => s[killsKey] !== null && s[killsKey] !== undefined)
        .map(s => s[killsKey]);
        
      const deathsValues = playerStats
        .filter(s => s[deathsKey] !== null && s[deathsKey] !== undefined)
        .map(s => s[deathsKey]);
        
      const assistsValues = playerStats
        .filter(s => s[assistsKey] !== null && s[assistsKey] !== undefined)
        .map(s => s[assistsKey]);
      
      // Calculer les moyennes
      const avgGold = calculateAverage(goldValues);
      const avgXp = calculateAverage(xpValues);
      const avgCs = calculateAverage(csValues);
      const avgGoldDiff = calculateAverage(goldDiffValues);
      const avgCsDiff = calculateAverage(csDiffValues);
      const avgKills = calculateAverage(killsValues, 1);
      const avgDeaths = calculateAverage(deathsValues, 1);
      const avgAssists = calculateAverage(assistsValues, 1);
      
      // Stocker les résultats
      result[time] = {
        avgGold: Math.round(avgGold),
        avgXp: Math.round(avgXp),
        avgCs: Math.round(avgCs),
        avgGoldDiff: Math.round(avgGoldDiff),
        avgCsDiff: Math.round(avgCsDiff),
        avgKills: Math.round(avgKills * 10) / 10, // Une décimale
        avgDeaths: Math.round(avgDeaths * 10) / 10, // Une décimale
        avgAssists: Math.round(avgAssists * 10) / 10 // Une décimale
      };
    });
    
    console.log("Statistiques timeline calculées:", result);
    return result;
  } catch (error) {
    console.error("Erreur lors du calcul des statistiques timeline:", error);
    return null;
  }
}

/**
 * Calcule la moyenne d'un tableau de valeurs
 * @param values Tableau de valeurs
 * @param defaultValue Valeur par défaut si le tableau est vide
 * @returns Moyenne des valeurs
 */
function calculateAverage(values: any[], defaultValue = 0) {
  if (!values || values.length === 0) return defaultValue;
  
  // Filtrer les valeurs non numériques
  const numericValues = values.filter(v => !isNaN(Number(v)));
  
  if (numericValues.length === 0) return defaultValue;
  
  // Calculer la moyenne
  const sum = numericValues.reduce((acc, val) => acc + Number(val), 0);
  return sum / numericValues.length;
}
