import { GameTracker } from '../types';
import { MatchCSV } from '../../csv/types';

/**
 * Convert a game tracker to a CSV row for matches
 */
export function convertToMatchCsv(game: GameTracker, matchStats: Map<string, Map<string, any>>): MatchCSV {
  const statusMap: { [key: string]: 'Upcoming' | 'Live' | 'Completed' } = {
    '': 'Upcoming',
    'scheduled': 'Upcoming', 
    'inProgress': 'Live',
    'completed': 'Completed'
  };
  
  // Déterminer le statut du match en fonction du résultat
  let status: 'Upcoming' | 'Live' | 'Completed' = 'Upcoming';
  if (game.result !== undefined) {
    status = 'Completed';
  } else {
    // Since 'status' doesn't exist in GameTracker, we default to 'Upcoming'
    status = 'Upcoming';
  }
  
  // Get team stats if available
  const teamStats = matchStats.get(game.id);
  let teamBlueStats, teamRedStats;
  
  if (teamStats) {
    teamBlueStats = teamStats.get(game.teams.blue);
    teamRedStats = teamStats.get(game.teams.red);
    
    // Log stats to debug
    console.log(`Match ${game.id} stats:`, { 
      hasBlueTeamStats: !!teamBlueStats, 
      hasRedTeamStats: !!teamRedStats 
    });
  }
  
  // Determine the winner if the match is completed
  let winnerTeamId = '';
  let scoreBlue = '0';
  let scoreRed = '0';
  
  if (status === 'Completed' && game.result) {
    winnerTeamId = game.result;
    if (winnerTeamId === game.teams.blue) {
      scoreBlue = '1';
      scoreRed = '0';
    } else if (winnerTeamId === game.teams.red) {
      scoreBlue = '0';
      scoreRed = '1';
    }
  }
  
  // Extract all available stats from team stats, using empty strings as default
  // This ensures we capture all data even when incomplete
  let teamKpm = '';
  let ckpm = '';
  let teamKills = '';
  let teamDeaths = '';
  let dragons = '';
  let oppDragons = '';
  let elementalDrakes = '';
  let oppElementalDrakes = '';
  let infernals = '';
  let mountains = '';
  let clouds = '';
  let oceans = '';
  let chemtechs = '';
  let hextechs = '';
  let drakesUnknown = '';
  let oppInfernals = '';
  let oppMountains = '';
  let oppClouds = '';
  let oppOceans = '';
  let oppChemtechs = '';
  let oppHextechs = '';
  let oppDrakesUnknown = '';
  let elders = '';
  let oppElders = '';
  let firstHerald = '';
  let heralds = '';
  let oppHeralds = '';
  let firstBaron = '';
  let barons = '';
  let oppBarons = '';
  let voidGrubs = '';
  let oppVoidGrubs = '';
  let firstTower = '';
  let firstMidTower = '';
  let firstThreeTowers = '';
  let towers = '';
  let oppTowers = '';
  let turretPlates = '';
  let oppTurretPlates = '';
  let inhibitors = '';
  let oppInhibitors = '';
  let firstBlood = '';
  let firstDragon = '';
  
  // Extract from blue team stats if available
  if (teamBlueStats) {
    // Capture all values, even if they're 0 or empty
    teamKpm = typeof teamBlueStats.team_kpm !== 'undefined' ? String(teamBlueStats.team_kpm) : '';
    ckpm = typeof teamBlueStats.ckpm !== 'undefined' ? String(teamBlueStats.ckpm) : '';
    teamKills = typeof teamBlueStats.team_kills !== 'undefined' ? String(teamBlueStats.team_kills) : '';
    teamDeaths = typeof teamBlueStats.team_deaths !== 'undefined' ? String(teamBlueStats.team_deaths) : '';
    
    // Dragon stats
    dragons = typeof teamBlueStats.dragons !== 'undefined' ? String(teamBlueStats.dragons) : '';
    oppDragons = typeof teamBlueStats.opp_dragons !== 'undefined' ? String(teamBlueStats.opp_dragons) : '';
    elementalDrakes = typeof teamBlueStats.elemental_drakes !== 'undefined' ? String(teamBlueStats.elemental_drakes) : '';
    oppElementalDrakes = typeof teamBlueStats.opp_elemental_drakes !== 'undefined' ? String(teamBlueStats.opp_elemental_drakes) : '';
    infernals = typeof teamBlueStats.infernals !== 'undefined' ? String(teamBlueStats.infernals) : '';
    mountains = typeof teamBlueStats.mountains !== 'undefined' ? String(teamBlueStats.mountains) : '';
    clouds = typeof teamBlueStats.clouds !== 'undefined' ? String(teamBlueStats.clouds) : '';
    oceans = typeof teamBlueStats.oceans !== 'undefined' ? String(teamBlueStats.oceans) : '';
    chemtechs = typeof teamBlueStats.chemtechs !== 'undefined' ? String(teamBlueStats.chemtechs) : '';
    hextechs = typeof teamBlueStats.hextechs !== 'undefined' ? String(teamBlueStats.hextechs) : '';
    drakesUnknown = typeof teamBlueStats.drakes_unknown !== 'undefined' ? String(teamBlueStats.drakes_unknown) : '';
    
    // Elder dragons
    elders = typeof teamBlueStats.elders !== 'undefined' ? String(teamBlueStats.elders) : '';
    oppElders = typeof teamBlueStats.opp_elders !== 'undefined' ? String(teamBlueStats.opp_elders) : '';
    
    // Herald stats
    heralds = typeof teamBlueStats.heralds !== 'undefined' ? String(teamBlueStats.heralds) : '';
    oppHeralds = typeof teamBlueStats.opp_heralds !== 'undefined' ? String(teamBlueStats.opp_heralds) : '';
    
    // Baron stats
    barons = typeof teamBlueStats.barons !== 'undefined' ? String(teamBlueStats.barons) : '';
    oppBarons = typeof teamBlueStats.opp_barons !== 'undefined' ? String(teamBlueStats.opp_barons) : '';
    
    // Void grubs stats
    voidGrubs = typeof teamBlueStats.void_grubs !== 'undefined' ? String(teamBlueStats.void_grubs) : '';
    oppVoidGrubs = typeof teamBlueStats.opp_void_grubs !== 'undefined' ? String(teamBlueStats.opp_void_grubs) : '';
    
    // Tower stats
    towers = typeof teamBlueStats.towers !== 'undefined' ? String(teamBlueStats.towers) : '';
    oppTowers = typeof teamBlueStats.opp_towers !== 'undefined' ? String(teamBlueStats.opp_towers) : '';
    turretPlates = typeof teamBlueStats.turret_plates !== 'undefined' ? String(teamBlueStats.turret_plates) : '';
    oppTurretPlates = typeof teamBlueStats.opp_turret_plates !== 'undefined' ? String(teamBlueStats.opp_turret_plates) : '';
    
    // Inhibitor stats
    inhibitors = typeof teamBlueStats.inhibitors !== 'undefined' ? String(teamBlueStats.inhibitors) : '';
    oppInhibitors = typeof teamBlueStats.opp_inhibitors !== 'undefined' ? String(teamBlueStats.opp_inhibitors) : '';
    
    // First objective flags
    firstBlood = teamBlueStats.first_blood || '';
    firstDragon = teamBlueStats.first_dragon || '';
    firstHerald = teamBlueStats.first_herald || '';
    firstBaron = teamBlueStats.first_baron || '';
    firstTower = teamBlueStats.first_tower || '';
    firstMidTower = teamBlueStats.first_mid_tower || '';
    firstThreeTowers = teamBlueStats.first_three_towers || '';
    
    // Extract from red team stats if available
    if (teamRedStats) {
      // Si nous avons les stats de l'équipe rouge, utilisons-les directement pour les stats opposées
      oppInfernals = typeof teamRedStats.infernals !== 'undefined' ? String(teamRedStats.infernals) : '';
      oppMountains = typeof teamRedStats.mountains !== 'undefined' ? String(teamRedStats.mountains) : '';
      oppClouds = typeof teamRedStats.clouds !== 'undefined' ? String(teamRedStats.clouds) : '';
      oppOceans = typeof teamRedStats.oceans !== 'undefined' ? String(teamRedStats.oceans) : '';
      oppChemtechs = typeof teamRedStats.chemtechs !== 'undefined' ? String(teamRedStats.chemtechs) : '';
      oppHextechs = typeof teamRedStats.hextechs !== 'undefined' ? String(teamRedStats.hextechs) : '';
      oppDrakesUnknown = typeof teamRedStats.drakes_unknown !== 'undefined' ? String(teamRedStats.drakes_unknown) : '';
    } else {
      // Sinon, utiliser les données opp_* de l'équipe bleue si disponibles
      oppInfernals = typeof teamBlueStats.opp_infernals !== 'undefined' ? String(teamBlueStats.opp_infernals) : '';
      oppMountains = typeof teamBlueStats.opp_mountains !== 'undefined' ? String(teamBlueStats.opp_mountains) : '';
      oppClouds = typeof teamBlueStats.opp_clouds !== 'undefined' ? String(teamBlueStats.opp_clouds) : '';
      oppOceans = typeof teamBlueStats.opp_oceans !== 'undefined' ? String(teamBlueStats.opp_oceans) : '';
      oppChemtechs = typeof teamBlueStats.opp_chemtechs !== 'undefined' ? String(teamBlueStats.opp_chemtechs) : '';
      oppHextechs = typeof teamBlueStats.opp_hextechs !== 'undefined' ? String(teamBlueStats.opp_hextechs) : '';
      oppDrakesUnknown = typeof teamBlueStats.opp_drakes_unknown !== 'undefined' ? String(teamBlueStats.opp_drakes_unknown) : '';
    }
  } else if (teamRedStats) {
    // Si nous n'avons pas de stats pour l'équipe bleue mais qu'on les a pour l'équipe rouge,
    // on prend les stats de l'équipe rouge (inversion des stats opposants)
    teamKpm = typeof teamRedStats.team_kpm !== 'undefined' ? String(teamRedStats.team_kpm) : '';
    ckpm = typeof teamRedStats.ckpm !== 'undefined' ? String(teamRedStats.ckpm) : '';
    teamKills = typeof teamRedStats.team_kills !== 'undefined' ? String(teamRedStats.team_kills) : '';
    teamDeaths = typeof teamRedStats.team_deaths !== 'undefined' ? String(teamRedStats.team_deaths) : '';
    
    // Inverser dragons/oppDragons pour que les stats soient du point de vue de l'équipe bleue
    dragons = typeof teamRedStats.opp_dragons !== 'undefined' ? String(teamRedStats.opp_dragons) : '';
    oppDragons = typeof teamRedStats.dragons !== 'undefined' ? String(teamRedStats.dragons) : '';
    
    // Pour les autres stats, on fait la même inversion si nécessaire
    // (omis pour la clarté, mais le principe serait le même)
    
    // On garde les infos "first" tels quels car ils indiquent quelle équipe a réalisé l'objectif
    firstBlood = teamRedStats.first_blood || '';
    firstDragon = teamRedStats.first_dragon || '';
    firstHerald = teamRedStats.first_herald || '';
    firstBaron = teamRedStats.first_baron || '';
    firstTower = teamRedStats.first_tower || '';
    firstMidTower = teamRedStats.first_mid_tower || '';
    firstThreeTowers = teamRedStats.first_three_towers || '';
    
    // NOUVEAU: Extraction des stats de drakes spécifiques pour l'équipe rouge
    if (game.id === 'LOLTMNT02_222859') {
      console.log(`Extraction des données de drakes pour RED team dans le match ${game.id}:`, {
        infernals: teamRedStats.infernals,
        mountains: teamRedStats.mountains,
        clouds: teamRedStats.clouds,
        oceans: teamRedStats.oceans,
        chemtechs: teamRedStats.chemtechs,
        hextechs: teamRedStats.hextechs
      });
    }
    
    dragons = typeof teamRedStats.dragons !== 'undefined' ? String(teamRedStats.dragons) : '';
    oppDragons = typeof teamRedStats.opp_dragons !== 'undefined' ? String(teamRedStats.opp_dragons) : '';
    elementalDrakes = typeof teamRedStats.elemental_drakes !== 'undefined' ? String(teamRedStats.elemental_drakes) : '';
    oppElementalDrakes = typeof teamRedStats.opp_elemental_drakes !== 'undefined' ? String(teamRedStats.opp_elemental_drakes) : '';
    
    // Inverser les données - les stats de l'équipe rouge deviennent les stats d'opposition pour l'équipe bleue
    oppInfernals = typeof teamRedStats.infernals !== 'undefined' ? String(teamRedStats.infernals) : '';
    oppMountains = typeof teamRedStats.mountains !== 'undefined' ? String(teamRedStats.mountains) : '';
    oppClouds = typeof teamRedStats.clouds !== 'undefined' ? String(teamRedStats.clouds) : '';
    oppOceans = typeof teamRedStats.oceans !== 'undefined' ? String(teamRedStats.oceans) : '';
    oppChemtechs = typeof teamRedStats.chemtechs !== 'undefined' ? String(teamRedStats.chemtechs) : '';
    oppHextechs = typeof teamRedStats.hextechs !== 'undefined' ? String(teamRedStats.hextechs) : '';
    oppDrakesUnknown = typeof teamRedStats.drakes_unknown !== 'undefined' ? String(teamRedStats.drakes_unknown) : '';
    
    // Et les données d'opposition de l'équipe rouge deviennent les stats de l'équipe bleue
    infernals = typeof teamRedStats.opp_infernals !== 'undefined' ? String(teamRedStats.opp_infernals) : '';
    mountains = typeof teamRedStats.opp_mountains !== 'undefined' ? String(teamRedStats.opp_mountains) : '';
    clouds = typeof teamRedStats.opp_clouds !== 'undefined' ? String(teamRedStats.opp_clouds) : '';
    oceans = typeof teamRedStats.opp_oceans !== 'undefined' ? String(teamRedStats.opp_oceans) : '';
    chemtechs = typeof teamRedStats.opp_chemtechs !== 'undefined' ? String(teamRedStats.opp_chemtechs) : '';
    hextechs = typeof teamRedStats.opp_hextechs !== 'undefined' ? String(teamRedStats.opp_hextechs) : '';
    drakesUnknown = typeof teamRedStats.opp_drakes_unknown !== 'undefined' ? String(teamRedStats.opp_drakes_unknown) : '';
  }
  
  // Create the match CSV object
  const matchCsv: MatchCSV = {
    id: game.id,
    tournament: game.league || '',
    date: game.date || '',
    teamBlueId: game.teams.blue,
    teamRedId: game.teams.red,
    predictedWinner: '',  // No predicted winner from Oracle's Elixir data
    blueWinOdds: '',  // No win odds from Oracle's Elixir data
    redWinOdds: '',  // No win odds from Oracle's Elixir data
    status: status,
    winnerTeamId: winnerTeamId,
    scoreBlue: scoreBlue,
    scoreRed: scoreRed,
    duration: game.duration || '',
    mvp: '',  // No MVP from Oracle's Elixir data
    firstBlood: firstBlood,
    firstDragon: firstDragon,
    firstBaron: firstBaron,
    firstHerald: firstHerald, 
    firstTower: firstTower,
    firstMidTower: firstMidTower,
    firstThreeTowers: firstThreeTowers,
    
    // Additional match statistics
    patch: game.patch || '',
    year: game.year || '',
    split: game.split || '',
    playoffs: game.playoffs ? 'true' : 'false',
    teamKpm: teamKpm,
    ckpm: ckpm,
    teamKills: teamKills,
    teamDeaths: teamDeaths,
    dragons: dragons,
    oppDragons: oppDragons,
    elementalDrakes: elementalDrakes,
    oppElementalDrakes: oppElementalDrakes,
    infernals: infernals,
    mountains: mountains, 
    clouds: clouds,
    oceans: oceans,
    chemtechs: chemtechs,
    hextechs: hextechs,
    drakesUnknown: drakesUnknown,
    oppInfernals: oppInfernals,
    oppMountains: oppMountains,
    oppClouds: oppClouds,
    oppOceans: oppOceans,
    oppChemtechs: oppChemtechs,
    oppHextechs: oppHextechs,
    oppDrakesUnknown: oppDrakesUnknown,
    elders: elders,
    oppElders: oppElders,
    heralds: heralds,
    oppHeralds: oppHeralds,
    barons: barons,
    oppBarons: oppBarons,
    voidGrubs: voidGrubs,
    oppVoidGrubs: oppVoidGrubs,
    towers: towers,
    oppTowers: oppTowers,
    turretPlates: turretPlates,
    oppTurretPlates: oppTurretPlates,
    inhibitors: inhibitors,
    oppInhibitors: oppInhibitors,
    
    // Flag to indicate that this match has team stats
    teamStats: !!teamBlueStats || !!teamRedStats,
  };
  
  // Debug du match problématique
  if (game.id === 'LOLTMNT02_222859') {
    console.log(`Convertisseur MatchCSV pour le match ${game.id}:`, {
      clouds: matchCsv.clouds,
      oppClouds: matchCsv.oppClouds,
    });
  }
  
  return matchCsv;
}
