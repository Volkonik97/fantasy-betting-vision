
import { Match } from '@/utils/models/types';

/**
 * Extract team-specific statistics from a match
 * This function helps extract statistics for each team separately from a match's extraStats
 */
export function extractTeamSpecificStats(match: Match): {
  blueTeamStats: Record<string, any>;
  redTeamStats: Record<string, any>;
} {
  const stats = match.extraStats || {};
  const blueTeamStats: Record<string, any> = {};
  const redTeamStats: Record<string, any> = {};
  
  // Statistiques de base de l'équipe bleue
  blueTeamStats.team_id = match.teamBlue?.id;
  blueTeamStats.match_id = match.id;
  blueTeamStats.team_kpm = stats.team_kpm || 0;
  blueTeamStats.ckpm = stats.ckpm || 0;
  blueTeamStats.team_kills = stats.team_kills || 0;
  blueTeamStats.team_deaths = stats.team_deaths || 0;
  
  // Dragons, barons et hérauts pour équipe bleue
  blueTeamStats.dragons = stats.dragons || 0;
  blueTeamStats.barons = stats.barons || 0;
  blueTeamStats.heralds = stats.heralds || 0;
  blueTeamStats.elders = stats.elders || 0;
  blueTeamStats.towers = stats.towers || 0;
  blueTeamStats.inhibitors = stats.inhibitors || 0;
  blueTeamStats.turret_plates = stats.turret_plates || 0;
  blueTeamStats.void_grubs = stats.void_grubs || 0;
  
  // Info sur les dragons élémentaires pour équipe bleue
  blueTeamStats.elemental_drakes = stats.elemental_drakes || 0;
  blueTeamStats.infernals = stats.infernals || 0;
  blueTeamStats.mountains = stats.mountains || 0;
  blueTeamStats.clouds = stats.clouds || 0;
  blueTeamStats.oceans = stats.oceans || 0;
  blueTeamStats.chemtechs = stats.chemtechs || 0;
  blueTeamStats.hextechs = stats.hextechs || 0;
  blueTeamStats.drakes_unknown = stats.drakes_unknown || 0;
  
  // Premiers objectifs pour équipe bleue
  // On vérifie si l'équipe bleue a obtenu l'objectif
  blueTeamStats.first_blood = stats.first_blood === match.teamBlue?.id;
  blueTeamStats.first_dragon = stats.first_dragon === match.teamBlue?.id;
  blueTeamStats.first_herald = stats.first_herald === match.teamBlue?.id;
  blueTeamStats.first_baron = stats.first_baron === match.teamBlue?.id;
  blueTeamStats.first_tower = stats.first_tower === match.teamBlue?.id;
  blueTeamStats.first_mid_tower = stats.first_mid_tower === match.teamBlue?.id;
  blueTeamStats.first_three_towers = stats.first_three_towers === match.teamBlue?.id;
  
  // Statistiques de base de l'équipe rouge
  redTeamStats.team_id = match.teamRed?.id;
  redTeamStats.match_id = match.id;
  redTeamStats.team_kpm = stats.team_kpm || 0; // Même KPM car c'est une stat globale
  redTeamStats.ckpm = stats.ckpm || 0; // Même CKPM car c'est une stat globale
  
  // Convertir les statistiques d'opposition pour l'équipe rouge
  redTeamStats.team_kills = stats.team_deaths || 0; // Morts de l'équipe bleue = kills de l'équipe rouge
  redTeamStats.team_deaths = stats.team_kills || 0; // Kills de l'équipe bleue = morts de l'équipe rouge
  
  // Convertir les statistiques opposées pour l'équipe rouge
  redTeamStats.dragons = stats.opp_dragons || 0;
  redTeamStats.barons = stats.opp_barons || 0;
  redTeamStats.heralds = stats.opp_heralds || 0;
  redTeamStats.elders = stats.opp_elders || 0;
  redTeamStats.towers = stats.opp_towers || 0;
  redTeamStats.inhibitors = stats.opp_inhibitors || 0;
  redTeamStats.turret_plates = stats.opp_turret_plates || 0;
  redTeamStats.void_grubs = stats.opp_void_grubs || 0;
  
  // CORRECTION: Ajouter les détails des dragons élémentaires pour l'équipe rouge
  redTeamStats.elemental_drakes = stats.opp_elemental_drakes || 0;
  
  // Chercher les données spécifiques aux drakes pour le côté rouge
  redTeamStats.infernals = stats.opp_infernals || 0;
  redTeamStats.mountains = stats.opp_mountains || 0;
  redTeamStats.clouds = stats.opp_clouds || 0;
  redTeamStats.oceans = stats.opp_oceans || 0;
  redTeamStats.chemtechs = stats.opp_chemtechs || 0;
  redTeamStats.hextechs = stats.opp_hextechs || 0;
  redTeamStats.drakes_unknown = stats.opp_drakes_unknown || 0;
  
  // Si nous avons le nombre total de dragons élémentaires pour l'équipe rouge
  // mais pas le détail par type, on fait une estimation proportionnelle
  const hasRedDrakeTotal = redTeamStats.elemental_drakes > 0 || redTeamStats.dragons > 0;
  const hasRedDrakeDetails = [
    'opp_infernals', 'opp_mountains', 'opp_clouds', 
    'opp_oceans', 'opp_chemtechs', 'opp_hextechs'
  ].some(key => typeof stats[key] !== 'undefined' && stats[key] !== null);
  
  // AJOUT: Vérifier si les détails des drakes sont cohérents avec le total
  const totalSpecificDrakes = 
    redTeamStats.infernals + 
    redTeamStats.mountains + 
    redTeamStats.clouds + 
    redTeamStats.oceans + 
    redTeamStats.chemtechs + 
    redTeamStats.hextechs;
  
  const totalRedDrakes = Math.max(redTeamStats.dragons, redTeamStats.elemental_drakes);
  
  // Si le nombre total de dragons spécifiques ne correspond pas au total déclaré,
  // et que le total déclaré est supérieur à 0, nous avons un problème de cohérence
  if (totalRedDrakes > 0 && totalSpecificDrakes !== totalRedDrakes) {
    console.log(`[DRAKE MISMATCH] Match ${match.id} - L'équipe rouge a ${totalRedDrakes} drakes au total mais ${totalSpecificDrakes} dans les détails`);
    
    // S'il y a plus de drakes spécifiques que le total, mettre à jour le total
    if (totalSpecificDrakes > totalRedDrakes) {
      redTeamStats.dragons = totalSpecificDrakes;
      redTeamStats.elemental_drakes = totalSpecificDrakes;
      console.log(`[DRAKE CORRECTION] Match ${match.id} - Correction du total de drakes pour l'équipe rouge: ${totalRedDrakes} -> ${totalSpecificDrakes}`);
    } 
    // S'il y a moins de drakes spécifiques que le total, ajouter la différence aux drakes inconnus
    else if (totalSpecificDrakes < totalRedDrakes && !hasRedDrakeDetails) {
      // Tenter de distribuer les drakes manquants en se basant sur les bleus
      if (hasRedDrakeTotal && !hasRedDrakeDetails) {
        // Distribution proportionnelle basée sur les données de l'équipe bleue
        const blueTotalDrakes = Math.max(blueTeamStats.elemental_drakes || 0, blueTeamStats.dragons || 0);
        
        if (blueTotalDrakes > 0) {
          // Calcul des pourcentages de chaque type de drake pour l'équipe bleue
          const infernalsPct = blueTotalDrakes > 0 ? (blueTeamStats.infernals || 0) / blueTotalDrakes : 0;
          const mountainsPct = blueTotalDrakes > 0 ? (blueTeamStats.mountains || 0) / blueTotalDrakes : 0;
          const cloudsPct = blueTotalDrakes > 0 ? (blueTeamStats.clouds || 0) / blueTotalDrakes : 0;
          const oceansPct = blueTotalDrakes > 0 ? (blueTeamStats.oceans || 0) / blueTotalDrakes : 0;
          const chemtechsPct = blueTotalDrakes > 0 ? (blueTeamStats.chemtechs || 0) / blueTotalDrakes : 0;
          const hextechsPct = blueTotalDrakes > 0 ? (blueTeamStats.hextechs || 0) / blueTotalDrakes : 0;
          
          // Distribution des drakes en fonction des pourcentages
          redTeamStats.infernals = Math.round(infernalsPct * totalRedDrakes);
          redTeamStats.mountains = Math.round(mountainsPct * totalRedDrakes);
          redTeamStats.clouds = Math.round(cloudsPct * totalRedDrakes);
          redTeamStats.oceans = Math.round(oceansPct * totalRedDrakes);
          redTeamStats.chemtechs = Math.round(chemtechsPct * totalRedDrakes);
          redTeamStats.hextechs = Math.round(hextechsPct * totalRedDrakes);
          
          // Recalcul du total pour ajuster les arrondis
          const newTotalSpecific = 
            redTeamStats.infernals + 
            redTeamStats.mountains + 
            redTeamStats.clouds + 
            redTeamStats.oceans + 
            redTeamStats.chemtechs + 
            redTeamStats.hextechs;
            
          // Correction finale avec drakes_unknown si nécessaire
          redTeamStats.drakes_unknown = totalRedDrakes - newTotalSpecific;
          
          console.log(`[DRAKE DISTRIBUTION] Match ${match.id} - Distribution des ${totalRedDrakes} drakes pour l'équipe rouge:`, {
            infernals: redTeamStats.infernals,
            mountains: redTeamStats.mountains,
            clouds: redTeamStats.clouds,
            oceans: redTeamStats.oceans,
            chemtechs: redTeamStats.chemtechs,
            hextechs: redTeamStats.hextechs,
            drakes_unknown: redTeamStats.drakes_unknown
          });
        } else {
          // Si pas assez d'informations sur l'équipe bleue, mettre tous les drakes inconnus
          redTeamStats.drakes_unknown = totalRedDrakes;
        }
      } else {
        // Mettre simplement la différence dans les drakes inconnus
        redTeamStats.drakes_unknown = totalRedDrakes - totalSpecificDrakes;
        console.log(`[DRAKE UNKNOWN] Match ${match.id} - Ajout de ${redTeamStats.drakes_unknown} drakes inconnus pour l'équipe rouge`);
      }
    }
  }
  
  // Premiers objectifs pour équipe rouge
  // On vérifie si l'équipe rouge a obtenu l'objectif
  redTeamStats.first_blood = stats.first_blood === match.teamRed?.id;
  redTeamStats.first_dragon = stats.first_dragon === match.teamRed?.id;
  redTeamStats.first_herald = stats.first_herald === match.teamRed?.id;
  redTeamStats.first_baron = stats.first_baron === match.teamRed?.id;
  redTeamStats.first_tower = stats.first_tower === match.teamRed?.id;
  redTeamStats.first_mid_tower = stats.first_mid_tower === match.teamRed?.id;
  redTeamStats.first_three_towers = stats.first_three_towers === match.teamRed?.id;
  
  // Picks et bans
  if (stats.picks) {
    blueTeamStats.picks = Object.entries(stats.picks)
      .filter(([key]) => key.startsWith('blue_'))
      .reduce((obj: Record<string, any>, [key, val]) => {
        obj[key] = val;
        return obj;
      }, {});
      
    redTeamStats.picks = Object.entries(stats.picks)
      .filter(([key]) => key.startsWith('red_'))
      .reduce((obj: Record<string, any>, [key, val]) => {
        obj[key] = val;
        return obj;
      }, {});
  }
  
  if (stats.bans) {
    blueTeamStats.bans = Object.entries(stats.bans)
      .filter(([key]) => key.startsWith('blue_'))
      .reduce((obj: Record<string, any>, [key, val]) => {
        obj[key] = val;
        return obj;
      }, {});
      
    redTeamStats.bans = Object.entries(stats.bans)
      .filter(([key]) => key.startsWith('red_'))
      .reduce((obj: Record<string, any>, [key, val]) => {
        obj[key] = val;
        return obj;
      }, {});
  }
  
  // Log pour le débogage
  if (match.id === 'LOLTMNT02_222859' || match.id === 'LOLTMNT01_204649') {
    console.log(`[DRAKE DEBUG] Statistiques extraites pour le match ${match.id}:`);
    console.log('Blue side drake details:', {
      infernals: blueTeamStats.infernals,
      mountains: blueTeamStats.mountains,
      clouds: blueTeamStats.clouds,
      oceans: blueTeamStats.oceans,
      chemtechs: blueTeamStats.chemtechs,
      hextechs: blueTeamStats.hextechs,
      drakes_unknown: blueTeamStats.drakes_unknown,
      total: blueTeamStats.dragons,
      elemental: blueTeamStats.elemental_drakes
    });
    
    console.log('Red side drake details:', {
      infernals: redTeamStats.infernals,
      mountains: redTeamStats.mountains,
      clouds: redTeamStats.clouds,
      oceans: redTeamStats.oceans,
      chemtechs: redTeamStats.chemtechs,
      hextechs: redTeamStats.hextechs,
      drakes_unknown: redTeamStats.drakes_unknown,
      total: redTeamStats.dragons,
      elemental: redTeamStats.elemental_drakes
    });
    
    // Log des valeurs brutes de l'extraStats pour le débogage
    console.log('Raw extraStats dragon values:', {
      dragons: stats.dragons,
      opp_dragons: stats.opp_dragons,
      elemental_drakes: stats.elemental_drakes,
      opp_elemental_drakes: stats.opp_elemental_drakes,
      infernals: stats.infernals,
      mountains: stats.mountains,
      clouds: stats.clouds,
      oceans: stats.oceans,
      chemtechs: stats.chemtechs,
      hextechs: stats.hextechs,
      opp_infernals: stats.opp_infernals,
      opp_mountains: stats.opp_mountains,
      opp_clouds: stats.opp_clouds,
      opp_oceans: stats.opp_oceans,
      opp_chemtechs: stats.opp_chemtechs,
      opp_hextechs: stats.opp_hextechs
    });
    
    // Vérification de cohérence
    const blueSpecificTotal = 
      (blueTeamStats.infernals || 0) + 
      (blueTeamStats.mountains || 0) + 
      (blueTeamStats.clouds || 0) + 
      (blueTeamStats.oceans || 0) + 
      (blueTeamStats.chemtechs || 0) + 
      (blueTeamStats.hextechs || 0) +
      (blueTeamStats.drakes_unknown || 0);
      
    const redSpecificTotal = 
      (redTeamStats.infernals || 0) + 
      (redTeamStats.mountains || 0) + 
      (redTeamStats.clouds || 0) + 
      (redTeamStats.oceans || 0) + 
      (redTeamStats.chemtechs || 0) + 
      (redTeamStats.hextechs || 0) +
      (redTeamStats.drakes_unknown || 0);
      
    console.log('[DRAKE CONSISTENCY] Vérification de cohérence des drakes:', {
      blueTotal: blueTeamStats.dragons,
      blueSpecificSum: blueSpecificTotal,
      blueDiff: blueTeamStats.dragons - blueSpecificTotal,
      redTotal: redTeamStats.dragons,
      redSpecificSum: redSpecificTotal,
      redDiff: redTeamStats.dragons - redSpecificTotal
    });
  }
  
  return { blueTeamStats, redTeamStats };
}
