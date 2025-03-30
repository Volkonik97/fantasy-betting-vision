
import { Match } from '@/utils/models/types';

/**
 * Extract team-specific stats from a match object
 */
export function extractTeamSpecificStats(match: Match): { 
  blueTeamStats: any, 
  redTeamStats: any 
} {
  if (!match.extraStats) {
    return { blueTeamStats: null, redTeamStats: null };
  }

  // Debug the raw dragons data directly from the match object
  if (['LOLTMNT02_215152', 'LOLTMNT02_222859'].includes(match.id)) {
    console.log(`[Raw Dragon Data for ${match.id}]`, {
      // Dragons data available in extraStats
      dragons: match.extraStats.dragons,
      infernals: match.extraStats.infernals,
      mountains: match.extraStats.mountains,
      clouds: match.extraStats.clouds,
      oceans: match.extraStats.oceans,
      chemtechs: match.extraStats.chemtechs,
      hextechs: match.extraStats.hextechs,
      elemental_drakes: match.extraStats.elemental_drakes,
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

  // Extraire les statistiques de dragons totales
  const totalDragonsByTeam = {
    blue: safeParseInt(match.extraStats.dragons),
    red: safeParseInt(match.extraStats.opp_dragons)
  };

  // Préparer les statistiques pour les deux équipes
  const blueTeamStats = {
    team_id: match.teamBlue.id,
    match_id: match.id,
    is_blue_side: true,
    kills: safeParseInt(match.extraStats.team_kills),
    deaths: safeParseInt(match.extraStats.team_deaths),
    kpm: match.extraStats.team_kpm || 0,
    
    // Dragons pour l'équipe bleue - utilisation des données sans préfixe
    dragons: totalDragonsByTeam.blue,
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
    first_dragon: match.extraStats.first_dragon === match.teamBlue.id,
    first_herald: match.extraStats.first_herald === match.teamBlue.id,
    first_baron: match.extraStats.first_baron === match.teamBlue.id,
    first_tower: match.extraStats.first_tower === match.teamBlue.id,
    first_mid_tower: match.extraStats.first_mid_tower === match.teamBlue.id,
    first_three_towers: match.extraStats.first_three_towers === match.teamBlue.id
  };

  // Pour l'équipe rouge, nous utilisons également les données sans préfixe "opp_"
  const redTeamStats = {
    team_id: match.teamRed.id,
    match_id: match.id,
    is_blue_side: false,
    kills: safeParseInt(match.extraStats.team_deaths), // inversé pour l'équipe rouge
    deaths: safeParseInt(match.extraStats.team_kills), // inversé pour l'équipe rouge
    kpm: 0, // Non disponible directement
    
    // Dragons pour l'équipe rouge - utilisation des mêmes données que l'équipe bleue
    dragons: totalDragonsByTeam.red,
    infernals: safeParseInt(match.extraStats.infernals),
    mountains: safeParseInt(match.extraStats.mountains),
    clouds: safeParseInt(match.extraStats.clouds),
    oceans: safeParseInt(match.extraStats.oceans),
    chemtechs: safeParseInt(match.extraStats.chemtechs),
    hextechs: safeParseInt(match.extraStats.hextechs),
    drakes_unknown: safeParseInt(match.extraStats.drakes_unknown),
    elemental_drakes: safeParseInt(match.extraStats.elemental_drakes),
    
    // Autres objectifs pour l'équipe rouge
    elders: safeParseInt(match.extraStats.opp_elders),
    heralds: safeParseInt(match.extraStats.opp_heralds),
    barons: safeParseInt(match.extraStats.opp_barons),
    towers: safeParseInt(match.extraStats.opp_towers),
    turret_plates: safeParseInt(match.extraStats.opp_turret_plates),
    inhibitors: safeParseInt(match.extraStats.opp_inhibitors),
    void_grubs: safeParseInt(match.extraStats.opp_void_grubs),
    
    // First objectives pour l'équipe rouge
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
    console.log(`[Debug] Match ${match.id} - statistiques d'équipe extraites:`, {
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
