
import { calculateAverage } from './helpers';
import { getPlayerMatchStats, getTeamPlayersStats } from './playerMatchStats';
import { calculateTimelineStats as calculateTimelineStatsUtil } from '@/utils/statistics/timelineStats';

/**
 * Récupère et calcule les statistiques de timeline pour un joueur spécifique
 * @param playerId ID du joueur
 * @returns Statistiques de timeline agrégées
 */
export async function getPlayerTimelineStats(playerId: string) {
  try {
    console.log(`Récupération des statistiques timeline pour le joueur ${playerId}`);
    
    // Récupérer toutes les statistiques du joueur
    const playerStats = await getPlayerMatchStats(playerId);
    
    if (!playerStats || playerStats.length === 0) {
      console.log(`Aucune statistique trouvée pour le joueur ${playerId}`);
      return null;
    }
    
    console.log(`Trouvé ${playerStats.length} statistiques pour le joueur ${playerId}`);
    
    // Utiliser la fonction existante pour calculer les statistiques timeline
    return calculateTimelineStatsUtil(playerStats);
  } catch (error) {
    console.error("Erreur lors du calcul des statistiques timeline du joueur:", error);
    return null;
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
