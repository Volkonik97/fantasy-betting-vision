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

  // Log pour déboguer le match problématique
  if (match.id === 'LOLTMNT02_215152') {
    console.log(`Extractions des stats d'équipe pour le match ${match.id}`, match.extraStats);
  }

  // Pour l'équipe bleue, utiliser directement les stats extraStats
  const blueTeamStats = {
    team_id: match.teamBlue.id,
    match_id: match.id,
    is_blue_side: true,
    kills: match.extraStats.team_kills || 0,
    deaths: match.extraStats.team_deaths || 0,
    kpm: match.extraStats.team_kpm || 0,
    dragons: match.extraStats.dragons || 0,
    infernals: match.extraStats.infernals || 0,
    mountains: match.extraStats.mountains || 0, 
    clouds: match.extraStats.clouds || 0,
    oceans: match.extraStats.oceans || 0,
    chemtechs: match.extraStats.chemtechs || 0,
    hextechs: match.extraStats.hextechs || 0,
    drakes_unknown: match.extraStats.drakes_unknown || 0,
    elders: match.extraStats.elders || 0,
    heralds: match.extraStats.heralds || 0,
    barons: match.extraStats.barons || 0,
    towers: match.extraStats.towers || 0,
    turret_plates: match.extraStats.turret_plates || 0,
    inhibitors: match.extraStats.inhibitors || 0,
    void_grubs: match.extraStats.void_grubs || 0,
    first_blood: match.extraStats.first_blood === match.teamBlue.id,
    first_dragon: match.extraStats.first_dragon === match.teamBlue.id,
    first_herald: match.extraStats.first_herald === match.teamBlue.id,
    first_baron: match.extraStats.first_baron === match.teamBlue.id,
    first_tower: match.extraStats.first_tower === match.teamBlue.id,
    first_mid_tower: match.extraStats.first_mid_tower === match.teamBlue.id,
    first_three_towers: match.extraStats.first_three_towers === match.teamBlue.id
  };

  // Pour l'équipe rouge, utiliser les stats opp_* des extraStats
  const redTeamStats = {
    team_id: match.teamRed.id,
    match_id: match.id,
    is_blue_side: false,
    kills: match.extraStats.team_deaths || 0, // inversé pour l'équipe rouge
    deaths: match.extraStats.team_kills || 0, // inversé pour l'équipe rouge
    kpm: 0, // Non disponible directement
    dragons: match.extraStats.opp_dragons || 0,
    infernals: match.extraStats.opp_infernals || 0,
    mountains: match.extraStats.opp_mountains || 0,
    clouds: match.extraStats.opp_clouds || 0,
    oceans: match.extraStats.opp_oceans || 0,
    chemtechs: match.extraStats.opp_chemtechs || 0,
    hextechs: match.extraStats.opp_hextechs || 0,
    drakes_unknown: match.extraStats.opp_drakes_unknown || 0,
    elders: match.extraStats.opp_elders || 0,
    heralds: match.extraStats.opp_heralds || 0,
    barons: match.extraStats.opp_barons || 0,
    towers: match.extraStats.opp_towers || 0,
    turret_plates: match.extraStats.opp_turret_plates || 0,
    inhibitors: match.extraStats.opp_inhibitors || 0,
    void_grubs: match.extraStats.opp_void_grubs || 0,
    first_blood: match.extraStats.first_blood === match.teamRed.id,
    first_dragon: match.extraStats.first_dragon === match.teamRed.id,
    first_herald: match.extraStats.first_herald === match.teamRed.id,
    first_baron: match.extraStats.first_baron === match.teamRed.id,
    first_tower: match.extraStats.first_tower === match.teamRed.id,
    first_mid_tower: match.extraStats.first_mid_tower === match.teamRed.id,
    first_three_towers: match.extraStats.first_three_towers === match.teamRed.id
  };

  // Vérifier la cohérence des données de dragons pour le match problématique
  if (match.id === 'LOLTMNT02_215152') {
    // Vérifier si le total des dragons correspond à la somme des types spécifiques pour l'équipe bleue
    const blueDragonSum = blueTeamStats.infernals + blueTeamStats.mountains + 
                          blueTeamStats.clouds + blueTeamStats.oceans + 
                          blueTeamStats.chemtechs + blueTeamStats.hextechs +
                          blueTeamStats.drakes_unknown;
    
    const redDragonSum = redTeamStats.infernals + redTeamStats.mountains + 
                         redTeamStats.clouds + redTeamStats.oceans + 
                         redTeamStats.chemtechs + redTeamStats.hextechs +
                         redTeamStats.drakes_unknown;
    
    console.log(`Match ${match.id} - Vérification des dragons:`, {
      blueTeam: {
        totalDragons: blueTeamStats.dragons,
        sumSpecificDragons: blueDragonSum,
        specificDragons: {
          infernals: blueTeamStats.infernals,
          mountains: blueTeamStats.mountains,
          clouds: blueTeamStats.clouds,
          oceans: blueTeamStats.oceans,
          chemtechs: blueTeamStats.chemtechs,
          hextechs: blueTeamStats.hextechs
        }
      },
      redTeam: {
        totalDragons: redTeamStats.dragons,
        sumSpecificDragons: redDragonSum,
        specificDragons: {
          infernals: redTeamStats.infernals,
          mountains: redTeamStats.mountains,
          clouds: redTeamStats.clouds,
          oceans: redTeamStats.oceans,
          chemtechs: redTeamStats.chemtechs,
          hextechs: redTeamStats.hextechs
        }
      }
    });
  }

  return {
    blueTeamStats,
    redTeamStats
  };
}
