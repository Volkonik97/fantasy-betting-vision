
import { Match } from '@/utils/models/types';
import { parseBoolean } from '@/utils/leagueData/types';

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
      redTeamStats: match.extraStats.redTeamStats || 'Missing red team stats',
      first_blood: match.extraStats.first_blood,
      first_blood_type: typeof match.extraStats.first_blood,
      first_dragon: match.extraStats.first_dragon,
      first_dragon_type: typeof match.extraStats.first_dragon,
      picks: match.extraStats.picks ? typeof match.extraStats.picks : 'Missing picks',
      bans: match.extraStats.bans ? typeof match.extraStats.bans : 'Missing bans'
    });
  }
  
  // Si nous avons déjà des statistiques spécifiques pour chaque équipe, les utiliser directement
  // En vérifiant leur existence
  const hasBlueTeamSpecificStats = match.extraStats.blueTeamStats !== undefined;
  const hasRedTeamSpecificStats = match.extraStats.redTeamStats !== undefined;
  
  // Process first_* fields to ensure they are correctly boolean for team stats
  const first_blood_blue = match.extraStats.first_blood === match.teamBlue.id || 
                          parseBoolean(match.extraStats.first_blood) === true;
                          
  const first_blood_red = match.extraStats.first_blood === match.teamRed.id || 
                         (parseBoolean(match.extraStats.first_blood) === false && 
                          match.extraStats.first_blood !== null);
  
  const first_dragon_blue = match.extraStats.first_dragon === match.teamBlue.id || 
                           parseBoolean(match.extraStats.first_dragon) === true;
                           
  const first_dragon_red = match.extraStats.first_dragon === match.teamRed.id || 
                          (parseBoolean(match.extraStats.first_dragon) === false && 
                           match.extraStats.first_dragon !== null);
  
  const first_herald_blue = match.extraStats.first_herald === match.teamBlue.id || 
                           parseBoolean(match.extraStats.first_herald) === true;
                           
  const first_herald_red = match.extraStats.first_herald === match.teamRed.id || 
                          (parseBoolean(match.extraStats.first_herald) === false && 
                           match.extraStats.first_herald !== null);
  
  const first_baron_blue = match.extraStats.first_baron === match.teamBlue.id || 
                          parseBoolean(match.extraStats.first_baron) === true;
                          
  const first_baron_red = match.extraStats.first_baron === match.teamRed.id || 
                         (parseBoolean(match.extraStats.first_baron) === false && 
                          match.extraStats.first_baron !== null);
  
  const first_tower_blue = match.extraStats.first_tower === match.teamBlue.id || 
                          parseBoolean(match.extraStats.first_tower) === true;
                          
  const first_tower_red = match.extraStats.first_tower === match.teamRed.id || 
                         (parseBoolean(match.extraStats.first_tower) === false && 
                          match.extraStats.first_tower !== null);
  
  const first_mid_tower_blue = match.extraStats.first_mid_tower === match.teamBlue.id || 
                              parseBoolean(match.extraStats.first_mid_tower) === true;
                              
  const first_mid_tower_red = match.extraStats.first_mid_tower === match.teamRed.id || 
                             (parseBoolean(match.extraStats.first_mid_tower) === false && 
                              match.extraStats.first_mid_tower !== null);
  
  const first_three_towers_blue = match.extraStats.first_three_towers === match.teamBlue.id || 
                                 parseBoolean(match.extraStats.first_three_towers) === true;
                                 
  const first_three_towers_red = match.extraStats.first_three_towers === match.teamRed.id || 
                                (parseBoolean(match.extraStats.first_three_towers) === false && 
                                 match.extraStats.first_three_towers !== null);
  
  // Debug first_* values
  if (['LOLTMNT02_215152', 'LOLTMNT02_222859'].includes(match.id)) {
    console.log(`[teamStatsExtractor] Processed first_* values for ${match.id}:`, {
      blueTeam: {
        first_blood: first_blood_blue,
        first_dragon: first_dragon_blue,
        first_herald: first_herald_blue,
        first_baron: first_baron_blue,
        first_tower: first_tower_blue,
        first_mid_tower: first_mid_tower_blue,
        first_three_towers: first_three_towers_blue
      },
      redTeam: {
        first_blood: first_blood_red,
        first_dragon: first_dragon_red,
        first_herald: first_herald_red,
        first_baron: first_baron_red,
        first_tower: first_tower_red,
        first_mid_tower: first_mid_tower_red,
        first_three_towers: first_three_towers_red
      },
      rawValues: {
        first_blood: match.extraStats.first_blood,
        first_dragon: match.extraStats.first_dragon,
        first_herald: match.extraStats.first_herald,
        first_baron: match.extraStats.first_baron,
        first_tower: match.extraStats.first_tower,
        first_mid_tower: match.extraStats.first_mid_tower,
        first_three_towers: match.extraStats.first_three_towers
      }
    });
  }
  
  // Récupérer les statistiques de l'équipe bleue
  const blueTeamStats = hasBlueTeamSpecificStats ? match.extraStats.blueTeamStats : {
    team_id: match.teamBlue.id,
    match_id: match.id,
    is_blue_side: true,
    // Fallback si les données spécifiques à l'équipe bleue sont manquantes
    kills: 0,
    deaths: 0,
    kpm: 0,
    
    // Statistiques des dragons
    dragons: match.extraStats.dragons || 0,
    elemental_drakes: match.extraStats.elemental_drakes || 0,
    infernals: match.extraStats.infernals || 0,
    mountains: match.extraStats.mountains || 0,
    clouds: match.extraStats.clouds || 0,
    oceans: match.extraStats.oceans || 0,
    chemtechs: match.extraStats.chemtechs || 0,
    hextechs: match.extraStats.hextechs || 0,
    drakes_unknown: match.extraStats.drakes_unknown || 0,
    elders: match.extraStats.elders || 0,

    // Autres objectifs
    heralds: match.extraStats.heralds || 0,
    barons: match.extraStats.barons || 0,
    towers: match.extraStats.towers || 0,
    turret_plates: match.extraStats.turret_plates || 0,
    inhibitors: match.extraStats.inhibitors || 0,
    void_grubs: match.extraStats.void_grubs || 0,
    
    // First objectives with processed boolean values
    first_blood: first_blood_blue,
    first_dragon: first_dragon_blue,
    first_herald: first_herald_blue,
    first_baron: first_baron_blue,
    first_tower: first_tower_blue,
    first_mid_tower: first_mid_tower_blue,
    first_three_towers: first_three_towers_blue,
    
    // Include picks and bans
    picks: match.extraStats.picks,
    bans: match.extraStats.bans
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
    
    // Statistiques des dragons
    dragons: match.extraStats.opp_dragons || 0,
    elemental_drakes: match.extraStats.opp_elemental_drakes || 0,
    infernals: match.extraStats.opp_infernals || 0,
    mountains: match.extraStats.opp_mountains || 0,
    clouds: match.extraStats.opp_clouds || 0,
    oceans: match.extraStats.opp_oceans || 0,
    chemtechs: match.extraStats.opp_chemtechs || 0,
    hextechs: match.extraStats.opp_hextechs || 0,
    drakes_unknown: match.extraStats.opp_drakes_unknown || 0,
    elders: match.extraStats.opp_elders || 0,
    
    // Autres objectifs
    heralds: match.extraStats.opp_heralds || 0,
    barons: match.extraStats.opp_barons || 0,
    towers: match.extraStats.opp_towers || 0,
    turret_plates: match.extraStats.opp_turret_plates || 0,
    inhibitors: match.extraStats.opp_inhibitors || 0,
    void_grubs: match.extraStats.opp_void_grubs || 0,
    
    // First objectives with processed boolean values
    first_blood: first_blood_red,
    first_dragon: first_dragon_red,
    first_herald: first_herald_red,
    first_baron: first_baron_red,
    first_tower: first_tower_red,
    first_mid_tower: first_mid_tower_red,
    first_three_towers: first_three_towers_red,
    
    // Include picks and bans
    picks: match.extraStats.picks,
    bans: match.extraStats.bans
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
        firstBlood: blueTeamStats.first_blood,
        firstDragon: blueTeamStats.first_dragon,
        firstHerald: blueTeamStats.first_herald,
        firstBaron: blueTeamStats.first_baron,
        firstTower: blueTeamStats.first_tower,
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
        firstBlood: redTeamStats.first_blood,
        firstDragon: redTeamStats.first_dragon,
        firstHerald: redTeamStats.first_herald,
        firstBaron: redTeamStats.first_baron,
        firstTower: redTeamStats.first_tower,
        usingSpecificStats: hasRedTeamSpecificStats
      }
    });
  }

  return {
    blueTeamStats,
    redTeamStats
  };
}
