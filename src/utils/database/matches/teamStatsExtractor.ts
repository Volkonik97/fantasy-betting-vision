
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
      // Blue team data
      dragons: match.extraStats.dragons,
      infernals: match.extraStats.infernals,
      mountains: match.extraStats.mountains,
      clouds: match.extraStats.clouds,
      oceans: match.extraStats.oceans,
      chemtechs: match.extraStats.chemtechs,
      hextechs: match.extraStats.hextechs,
      
      // Red team data
      opp_dragons: match.extraStats.opp_dragons,
      opp_infernals: match.extraStats.opp_infernals,
      opp_mountains: match.extraStats.opp_mountains,
      opp_clouds: match.extraStats.opp_clouds,
      opp_oceans: match.extraStats.opp_oceans,
      opp_chemtechs: match.extraStats.opp_chemtechs,
      opp_hextechs: match.extraStats.opp_hextechs
    });
  }

  // Pour l'équipe bleue, utiliser directement les stats extraStats
  const blueTeamStats = {
    team_id: match.teamBlue.id,
    match_id: match.id,
    is_blue_side: true,
    kills: match.extraStats.team_kills || 0,
    deaths: match.extraStats.team_deaths || 0,
    kpm: match.extraStats.team_kpm || 0,
    
    // Dragons - Blue Team (direct values)
    dragons: parseInt(match.extraStats.dragons || '0'),
    infernals: parseInt(match.extraStats.infernals || '0'),
    mountains: parseInt(match.extraStats.mountains || '0'), 
    clouds: parseInt(match.extraStats.clouds || '0'),
    oceans: parseInt(match.extraStats.oceans || '0'),
    chemtechs: parseInt(match.extraStats.chemtechs || '0'),
    hextechs: parseInt(match.extraStats.hextechs || '0'),
    drakes_unknown: parseInt(match.extraStats.drakes_unknown || '0'),
    elemental_drakes: parseInt(match.extraStats.elemental_drakes || '0'),
    
    // Autres objectifs
    elders: parseInt(match.extraStats.elders || '0'),
    heralds: parseInt(match.extraStats.heralds || '0'),
    barons: parseInt(match.extraStats.barons || '0'),
    towers: parseInt(match.extraStats.towers || '0'),
    turret_plates: parseInt(match.extraStats.turret_plates || '0'),
    inhibitors: parseInt(match.extraStats.inhibitors || '0'),
    void_grubs: parseInt(match.extraStats.void_grubs || '0'),
    
    // First objectives
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
    
    // Dragons - Red Team (opp_ values)
    dragons: parseInt(match.extraStats.opp_dragons || '0'),
    infernals: parseInt(match.extraStats.opp_infernals || '0'),
    mountains: parseInt(match.extraStats.opp_mountains || '0'),
    clouds: parseInt(match.extraStats.opp_clouds || '0'),
    oceans: parseInt(match.extraStats.opp_oceans || '0'),
    chemtechs: parseInt(match.extraStats.opp_chemtechs || '0'),
    hextechs: parseInt(match.extraStats.opp_hextechs || '0'),
    drakes_unknown: parseInt(match.extraStats.opp_drakes_unknown || '0'),
    elemental_drakes: parseInt(match.extraStats.opp_elemental_drakes || '0'),
    
    // Autres objectifs pour l'équipe rouge
    elders: parseInt(match.extraStats.opp_elders || '0'),
    heralds: parseInt(match.extraStats.opp_heralds || '0'),
    barons: parseInt(match.extraStats.opp_barons || '0'),
    towers: parseInt(match.extraStats.opp_towers || '0'),
    turret_plates: parseInt(match.extraStats.opp_turret_plates || '0'),
    inhibitors: parseInt(match.extraStats.opp_inhibitors || '0'),
    void_grubs: parseInt(match.extraStats.opp_void_grubs || '0'),
    
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
