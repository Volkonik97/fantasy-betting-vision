
import { Match } from '@/utils/models/types';

/**
 * Extract team-specific stats from a match object
 * Cette fonction part du principe que chaque équipe a ses propres statistiques complètes et indépendantes,
 * sans référence croisée à l'équipe adverse.
 */
export function extractTeamSpecificStats(match: Match): { 
  blueTeamStats: any, 
  redTeamStats: any 
} {
  if (!match.extraStats) {
    return { blueTeamStats: null, redTeamStats: null };
  }

  // Debug pour les matchs spécifiques
  if (['LOLTMNT02_215152', 'LOLTMNT02_222859'].includes(match.id)) {
    console.log(`[Raw Data for ${match.id}]`, {
      // Statistiques disponibles dans extraStats
      dragons: match.extraStats.dragons,
      infernals: match.extraStats.infernals,
      mountains: match.extraStats.mountains,
      clouds: match.extraStats.clouds,
      oceans: match.extraStats.oceans,
      chemtechs: match.extraStats.chemtechs,
      hextechs: match.extraStats.hextechs,
      elemental_drakes: match.extraStats.elemental_drakes
    });
  }

  // Helper function to safely convert any value to an integer
  const safeParseInt = (value: any): number => {
    if (typeof value === 'number') {
      return Math.floor(value); // Convert to integer if it's already a number
    }
    if (value === null || value === undefined || value === '') {
      return 0;
    }
    const parsed = parseInt(String(value), 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  // First dragon is a dependency - if blue team has first dragon, red team doesn't
  const firstDragon = match.extraStats.first_dragon;
  const blueHasFirstDragon = firstDragon === match.teamBlue.id;
  const redHasFirstDragon = firstDragon === match.teamRed.id;

  // Créer les statistiques pour l'équipe bleue
  const blueTeamStats = {
    team_id: match.teamBlue.id,
    match_id: match.id,
    is_blue_side: true,
    kills: safeParseInt(match.extraStats.team_kills),
    deaths: safeParseInt(match.extraStats.team_deaths),
    kpm: match.extraStats.team_kpm || 0,
    
    // Dragons pour l'équipe bleue
    dragons: safeParseInt(match.extraStats.dragons),
    infernals: safeParseInt(match.extraStats.infernals),
    mountains: safeParseInt(match.extraStats.mountains), 
    clouds: safeParseInt(match.extraStats.clouds),
    oceans: safeParseInt(match.extraStats.oceans),
    chemtechs: safeParseInt(match.extraStats.chemtechs),
    hextechs: safeParseInt(match.extraStats.hextechs),
    drakes_unknown: safeParseInt(match.extraStats.drakes_unknown),
    elemental_drakes: safeParseInt(match.extraStats.elemental_drakes),
    
    // Autres objectifs
    elders: safeParseInt(match.extraStats.elders),
    heralds: safeParseInt(match.extraStats.heralds),
    barons: safeParseInt(match.extraStats.barons),
    towers: safeParseInt(match.extraStats.towers),
    turret_plates: safeParseInt(match.extraStats.turret_plates),
    inhibitors: safeParseInt(match.extraStats.inhibitors),
    void_grubs: safeParseInt(match.extraStats.void_grubs),
    
    // First objectives
    first_blood: match.extraStats.first_blood === match.teamBlue.id,
    first_dragon: blueHasFirstDragon,
    first_herald: match.extraStats.first_herald === match.teamBlue.id,
    first_baron: match.extraStats.first_baron === match.teamBlue.id,
    first_tower: match.extraStats.first_tower === match.teamBlue.id,
    first_mid_tower: match.extraStats.first_mid_tower === match.teamBlue.id,
    first_three_towers: match.extraStats.first_three_towers === match.teamBlue.id
  };

  // Pour l'équipe rouge, nous n'utilisons plus les préfixes "opp_"
  // Dans une structure à deux lignes indépendantes, nous n'avons pas cette information ici
  // Ces valeurs devront être fournies indépendamment lors du traitement des données
  const redTeamStats = {
    team_id: match.teamRed.id,
    match_id: match.id,
    is_blue_side: false,
    
    // Note: Nous n'avons pas accès aux statistiques spécifiques de l'équipe rouge
    // dans ce contexte avec la structure de données actuelle.
    // Ces valeurs sont donc provisoires et devront être remplacées par les vraies données
    kills: 0,   // À remplacer par les données réelles de l'équipe rouge
    deaths: 0,  // À remplacer par les données réelles de l'équipe rouge
    kpm: 0,     // À remplacer par les données réelles de l'équipe rouge
    
    // Dragons pour l'équipe rouge (à compléter avec les vraies données)
    dragons: 0,
    infernals: 0,
    mountains: 0,
    clouds: 0,
    oceans: 0,
    chemtechs: 0,
    hextechs: 0,
    drakes_unknown: 0,
    elemental_drakes: 0,
    
    // Autres objectifs pour l'équipe rouge (à compléter)
    elders: 0,
    heralds: 0,
    barons: 0,
    towers: 0,
    turret_plates: 0,
    inhibitors: 0,
    void_grubs: 0,
    
    // First objectives pour l'équipe rouge
    first_blood: match.extraStats.first_blood === match.teamRed.id,
    first_dragon: redHasFirstDragon,
    first_herald: match.extraStats.first_herald === match.teamRed.id,
    first_baron: match.extraStats.first_baron === match.teamRed.id,
    first_tower: match.extraStats.first_tower === match.teamRed.id,
    first_mid_tower: match.extraStats.first_mid_tower === match.teamRed.id,
    first_three_towers: match.extraStats.first_three_towers === match.teamRed.id
  };

  // Debugging pour les matchs spécifiques qui posent problème
  const debugMatchIds = ['LOLTMNT02_215152', 'LOLTMNT02_222859'];
  if (debugMatchIds.includes(match.id)) {
    console.log(`[Debug] Match ${match.id} - statistiques extraites (nouveau modèle indépendant):`, {
      teamBlue: {
        id: match.teamBlue.id,
        totalDragons: blueTeamStats.dragons,
        detailDragons: {
          infernals: blueTeamStats.infernals,
          mountains: blueTeamStats.mountains,
          clouds: blueTeamStats.clouds,
          oceans: blueTeamStats.oceans,
          chemtechs: blueTeamStats.chemtechs,
          hextechs: blueTeamStats.hextechs,
          unknown: blueTeamStats.drakes_unknown
        }
      },
      teamRed: {
        id: match.teamRed.id,
        // Note: Ces données sont provisoires et ne reflètent pas les vraies stats de l'équipe rouge
        totalDragons: redTeamStats.dragons,
        detailDragons: {
          infernals: redTeamStats.infernals,
          mountains: redTeamStats.mountains,
          clouds: redTeamStats.clouds,
          oceans: redTeamStats.oceans,
          chemtechs: redTeamStats.chemtechs,
          hextechs: redTeamStats.hextechs,
          unknown: redTeamStats.drakes_unknown
        }
      }
    });
  }

  return {
    blueTeamStats,
    redTeamStats
  };
}
