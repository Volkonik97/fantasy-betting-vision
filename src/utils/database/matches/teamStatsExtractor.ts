
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
  // Au lieu d'initialiser à 0, on utilise les données disponibles ou une estimation basée sur opp_elemental_drakes
  redTeamStats.elemental_drakes = stats.opp_elemental_drakes || 0;
  
  // Si nous avons le nombre total de dragons élémentaires pour l'équipe rouge
  // mais pas le détail par type, on fait une estimation proportionnelle
  const hasRedDrakeTotal = redTeamStats.elemental_drakes > 0;
  const hasRedDrakeDetails = [
    'opp_infernals', 'opp_mountains', 'opp_clouds', 
    'opp_oceans', 'opp_chemtechs', 'opp_hextechs'
  ].some(key => typeof stats[key] !== 'undefined' && stats[key] !== null);
  
  if (hasRedDrakeTotal && !hasRedDrakeDetails) {
    // Distribution proportionnelle basée sur les données de l'équipe bleue
    const blueTotalDrakes = blueTeamStats.elemental_drakes || 0;
    const redTotalDrakes = redTeamStats.elemental_drakes || 0;
    
    // Chercher les données spécifiques aux drakes pour le côté rouge
    // On utilise directement les valeurs opposées aux statistiques de l'équipe bleue
    redTeamStats.infernals = stats.opp_infernals || 0;
    redTeamStats.mountains = stats.opp_mountains || 0;
    redTeamStats.clouds = stats.opp_clouds || 0;
    redTeamStats.oceans = stats.opp_oceans || 0;
    redTeamStats.chemtechs = stats.opp_chemtechs || 0;
    redTeamStats.hextechs = stats.opp_hextechs || 0;
    redTeamStats.drakes_unknown = stats.opp_drakes_unknown || 0;
    
    // Si nous n'avons toujours pas de données spécifiques mais que nous connaissons le total
    // nous répartissons proportionnellement en fonction des types des drakes de l'équipe bleue
    const infernalsPct = blueTotalDrakes > 0 ? (blueTeamStats.infernals || 0) / blueTotalDrakes : 0;
    const mountainsPct = blueTotalDrakes > 0 ? (blueTeamStats.mountains || 0) / blueTotalDrakes : 0;
    const cloudsPct = blueTotalDrakes > 0 ? (blueTeamStats.clouds || 0) / blueTotalDrakes : 0;
    const oceansPct = blueTotalDrakes > 0 ? (blueTeamStats.oceans || 0) / blueTotalDrakes : 0;
    const chemtechsPct = blueTotalDrakes > 0 ? (blueTeamStats.chemtechs || 0) / blueTotalDrakes : 0;
    const hextechsPct = blueTotalDrakes > 0 ? (blueTeamStats.hextechs || 0) / blueTotalDrakes : 0;
    
    // Si les données spécifiques ne sont pas disponibles, on utilise les pourcentages
    if (redTeamStats.infernals === 0 && redTotalDrakes > 0) redTeamStats.infernals = Math.round(infernalsPct * redTotalDrakes);
    if (redTeamStats.mountains === 0 && redTotalDrakes > 0) redTeamStats.mountains = Math.round(mountainsPct * redTotalDrakes);
    if (redTeamStats.clouds === 0 && redTotalDrakes > 0) redTeamStats.clouds = Math.round(cloudsPct * redTotalDrakes);
    if (redTeamStats.oceans === 0 && redTotalDrakes > 0) redTeamStats.oceans = Math.round(oceansPct * redTotalDrakes);
    if (redTeamStats.chemtechs === 0 && redTotalDrakes > 0) redTeamStats.chemtechs = Math.round(chemtechsPct * redTotalDrakes);
    if (redTeamStats.hextechs === 0 && redTotalDrakes > 0) redTeamStats.hextechs = Math.round(hextechsPct * redTotalDrakes);
    
    // Ajuster les drakes inconnus pour que le total corresponde
    const redKnownDrakes = redTeamStats.infernals + redTeamStats.mountains + 
                          redTeamStats.clouds + redTeamStats.oceans + 
                          redTeamStats.chemtechs + redTeamStats.hextechs;
                          
    if (redKnownDrakes < redTotalDrakes) {
      redTeamStats.drakes_unknown = redTotalDrakes - redKnownDrakes;
    }
  } else {
    // S'il n'y a pas de données sur le total de dragons, on initialise les champs à 0
    // ou on utilise les valeurs opposées s'il y en a
    redTeamStats.infernals = stats.opp_infernals || 0;
    redTeamStats.mountains = stats.opp_mountains || 0;
    redTeamStats.clouds = stats.opp_clouds || 0;
    redTeamStats.oceans = stats.opp_oceans || 0;
    redTeamStats.chemtechs = stats.opp_chemtechs || 0;
    redTeamStats.hextechs = stats.opp_hextechs || 0;
    redTeamStats.drakes_unknown = stats.opp_drakes_unknown || 0;
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
  
  // Log pour le débogage de ce match problématique
  if (match.id === 'LOLTMNT02_222859') {
    console.log(`Statistiques extraites pour le match ${match.id}:`);
    console.log('Blue side drake details:', {
      infernals: blueTeamStats.infernals,
      mountains: blueTeamStats.mountains,
      clouds: blueTeamStats.clouds,
      oceans: blueTeamStats.oceans,
      chemtechs: blueTeamStats.chemtechs,
      hextechs: blueTeamStats.hextechs,
      drakes_unknown: blueTeamStats.drakes_unknown,
      total: blueTeamStats.dragons
    });
    
    console.log('Red side drake details:', {
      infernals: redTeamStats.infernals,
      mountains: redTeamStats.mountains,
      clouds: redTeamStats.clouds,
      oceans: redTeamStats.oceans,
      chemtechs: redTeamStats.chemtechs,
      hextechs: redTeamStats.hextechs,
      drakes_unknown: redTeamStats.drakes_unknown,
      total: redTeamStats.dragons
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
  }
  
  return { blueTeamStats, redTeamStats };
}
