
import { Match } from '@/utils/models/types';

/**
 * Extract team-specific stats from a match object
 * Cette fonction extrait les statistiques propres à chaque équipe à partir de l'objet match.
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
    console.log(`[teamStatsExtractor] Raw Data for ${match.id}:`, {
      blueTeamStats: match.extraStats.blueTeamStats || 'Missing blue team stats',
      redTeamStats: match.extraStats.redTeamStats || 'Missing red team stats'
    });
  }
  
  // Si nous avons déjà des statistiques spécifiques pour chaque équipe, les utiliser directement
  // En vérifiant leur existence
  const hasBlueTeamSpecificStats = match.extraStats.blueTeamStats !== undefined;
  const hasRedTeamSpecificStats = match.extraStats.redTeamStats !== undefined;
  
  // Récupérer les statistiques de l'équipe bleue
  const blueTeamStats = hasBlueTeamSpecificStats ? match.extraStats.blueTeamStats : {
    team_id: match.teamBlue.id,
    match_id: match.id,
    is_blue_side: true,
    // Fallback si les données spécifiques à l'équipe bleue sont manquantes
    kills: 0,
    deaths: 0,
    kpm: 0,
    dragons: 0,
    infernals: 0,
    mountains: 0,
    clouds: 0,
    oceans: 0,
    chemtechs: 0,
    hextechs: 0,
    drakes_unknown: 0,
    elemental_drakes: 0,
    elders: 0,
    heralds: 0,
    barons: 0,
    towers: 0,
    turret_plates: 0,
    inhibitors: 0,
    void_grubs: 0,
    
    // First objectives - vérifier si l'équipe bleue est le premier à réaliser l'objectif
    first_blood: match.extraStats.first_blood === match.teamBlue.id,
    first_dragon: match.extraStats.first_dragon === match.teamBlue.id,
    first_herald: match.extraStats.first_herald === match.teamBlue.id,
    first_baron: match.extraStats.first_baron === match.teamBlue.id,
    first_tower: match.extraStats.first_tower === match.teamBlue.id,
    first_mid_tower: match.extraStats.first_mid_tower === match.teamBlue.id,
    first_three_towers: match.extraStats.first_three_towers === match.teamBlue.id
  };

  // Récupérer les statistiques de l'équipe rouge
  const redTeamStats = hasRedTeamSpecificStats ? match.extraStats.redTeamStats : {
    team_id: match.teamRed.id,
    match_id: match.id,
    is_blue_side: false,
    // Fallback si les données spécifiques à l'équipe rouge sont manquantes
    kills: 0,
    deaths: 0,
    kpm: 0,
    dragons: 0,
    infernals: 0,
    mountains: 0,
    clouds: 0,
    oceans: 0,
    chemtechs: 0,
    hextechs: 0,
    drakes_unknown: 0,
    elemental_drakes: 0,
    elders: 0,
    heralds: 0,
    barons: 0,
    towers: 0,
    turret_plates: 0,
    inhibitors: 0,
    void_grubs: 0,
    
    // First objectives - vérifier si l'équipe rouge est le premier à réaliser l'objectif
    first_blood: match.extraStats.first_blood === match.teamRed.id,
    first_dragon: match.extraStats.first_dragon === match.teamRed.id,
    first_herald: match.extraStats.first_herald === match.teamRed.id,
    first_baron: match.extraStats.first_baron === match.teamRed.id,
    first_tower: match.extraStats.first_tower === match.teamRed.id,
    first_mid_tower: match.extraStats.first_mid_tower === match.teamRed.id,
    first_three_towers: match.extraStats.first_three_towers === match.teamRed.id
  };

  // Debugging pour les matchs spécifiques qui posent problème
  const debugMatchIds = ['LOLTMNT02_215152', 'LOLTMNT02_222859'];
  if (debugMatchIds.includes(match.id)) {
    console.log(`[teamStatsExtractor] Match ${match.id} - statistiques extraites:`, {
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
        },
        usingSpecificStats: hasBlueTeamSpecificStats
      },
      teamRed: {
        id: match.teamRed.id,
        totalDragons: redTeamStats.dragons,
        detailDragons: {
          infernals: redTeamStats.infernals,
          mountains: redTeamStats.mountains,
          clouds: redTeamStats.clouds,
          oceans: redTeamStats.oceans,
          chemtechs: redTeamStats.chemtechs,
          hextechs: redTeamStats.hextechs,
          unknown: redTeamStats.drakes_unknown
        },
        usingSpecificStats: hasRedTeamSpecificStats
      }
    });
  }

  return {
    blueTeamStats,
    redTeamStats
  };
}
