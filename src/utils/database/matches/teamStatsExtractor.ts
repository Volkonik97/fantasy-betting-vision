
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
  redTeamStats.elemental_drakes = stats.opp_elemental_drakes || 0;
  
  // Les statistiques détaillées des dragons ne sont généralement pas disponibles pour l'équipe rouge
  // via l'API Oracle's Elixir, donc nous les initialisons à 0
  redTeamStats.infernals = 0;
  redTeamStats.mountains = 0;
  redTeamStats.clouds = 0;
  redTeamStats.oceans = 0;
  redTeamStats.chemtechs = 0;
  redTeamStats.hextechs = 0;
  redTeamStats.drakes_unknown = 0;
  
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
  
  return { blueTeamStats, redTeamStats };
}
