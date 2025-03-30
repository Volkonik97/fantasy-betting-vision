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
  
  // Extract stats from team stats
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
  
  if (teamBlueStats) {
    teamKpm = teamBlueStats.team_kpm?.toString() || '';
    ckpm = teamBlueStats.ckpm?.toString() || '';
    teamKills = teamBlueStats.team_kills?.toString() || '';
    teamDeaths = teamBlueStats.team_deaths?.toString() || '';
    dragons = teamBlueStats.dragons?.toString() || '';
    oppDragons = teamBlueStats.opp_dragons?.toString() || '';
    elementalDrakes = teamBlueStats.elemental_drakes?.toString() || '';
    oppElementalDrakes = teamBlueStats.opp_elemental_drakes?.toString() || '';
    infernals = teamBlueStats.infernals?.toString() || '';
    mountains = teamBlueStats.mountains?.toString() || '';
    clouds = teamBlueStats.clouds?.toString() || '';
    oceans = teamBlueStats.oceans?.toString() || '';
    chemtechs = teamBlueStats.chemtechs?.toString() || '';
    hextechs = teamBlueStats.hextechs?.toString() || '';
    drakesUnknown = teamBlueStats.drakes_unknown?.toString() || '';
    elders = teamBlueStats.elders?.toString() || '';
    oppElders = teamBlueStats.opp_elders?.toString() || '';
    heralds = teamBlueStats.heralds?.toString() || '';
    oppHeralds = teamBlueStats.opp_heralds?.toString() || '';
    barons = teamBlueStats.barons?.toString() || '';
    oppBarons = teamBlueStats.opp_barons?.toString() || '';
    voidGrubs = teamBlueStats.void_grubs?.toString() || '';
    oppVoidGrubs = teamBlueStats.opp_void_grubs?.toString() || '';
    towers = teamBlueStats.towers?.toString() || '';
    oppTowers = teamBlueStats.opp_towers?.toString() || '';
    turretPlates = teamBlueStats.turret_plates?.toString() || '';
    oppTurretPlates = teamBlueStats.opp_turret_plates?.toString() || '';
    inhibitors = teamBlueStats.inhibitors?.toString() || '';
    oppInhibitors = teamBlueStats.opp_inhibitors?.toString() || '';
    
    // Check if blue team got first objective
    firstBlood = teamBlueStats.first_blood || '';
    firstDragon = teamBlueStats.first_dragon || '';
    firstHerald = teamBlueStats.first_herald || '';
    firstBaron = teamBlueStats.first_baron || '';
    firstTower = teamBlueStats.first_tower || '';
    firstMidTower = teamBlueStats.first_mid_tower || '';
    firstThreeTowers = teamBlueStats.first_three_towers || '';
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
    teamStats: !!teamBlueStats,
    
    // Additional properties for raw data export
    // These will be populated later if needed
  };
  
  return matchCsv;
}
