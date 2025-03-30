
import { GameTracker, MatchTeamStats } from '../types';
import { LeagueGameDataRow } from '../../csv/types';
import { Match } from '../../models/types';
import { extractPicksAndBans } from '../match/picksAndBansExtractor';
import { extractTeamSpecificStats } from '../../database/matches/teamStatsExtractor';

/**
 * Process match data and extract match object
 */
export function processMatchObject(
  match: any, 
  teams: any[], 
  matchStats: Map<string, Map<string, any>>,
  gameRows: LeagueGameDataRow[]
): Match | null {
  const blueTeam = teams.find(t => t.id === match.teamBlueId);
  const redTeam = teams.find(t => t.id === match.teamRedId);
  
  if (!blueTeam || !redTeam) {
    console.warn(`Match ${match.id} is missing a team: blue=${match.teamBlueId}, red=${match.teamRedId}`);
    // Skip this match if teams are missing
    return null;
  }
  
  // Find team stats for this match
  const teamStatsMap = matchStats.get(match.id);
  
  // Extract picks and bans data from group data for this match
  const { picks: picksData, bans: bansData } = extractPicksAndBans(gameRows);
  
  // Identify blue and red team rows
  const blueTeamRows = gameRows.filter(row => 
    row.side?.toLowerCase() === 'blue' || 
    row.teamposition?.toLowerCase() === 'blue'
  );
  
  const redTeamRows = gameRows.filter(row => 
    row.side?.toLowerCase() === 'red' || 
    row.teamposition?.toLowerCase() === 'red'
  );
  
  // Log warnings if team rows are missing
  if (blueTeamRows.length === 0) {
    console.warn(`Match ${match.id}: No blue team rows found`);
  }
  
  if (redTeamRows.length === 0) {
    console.warn(`Match ${match.id}: No red team rows found`);
  }
  
  // Create match object
  const matchObject: Match = {
    id: match.id,
    tournament: match.tournament,
    date: match.date,
    teamBlue: blueTeam,
    teamRed: redTeam,
    predictedWinner: match.predictedWinner,
    blueWinOdds: parseFloat(match.blueWinOdds) || 0.5,
    redWinOdds: parseFloat(match.redWinOdds) || 0.5,
    status: match.status as 'Upcoming' | 'Live' | 'Completed',
    // Always initialize extraStats, even if no team stats available
    extraStats: {
      patch: match.patch || '',
      year: match.year || '',
      split: match.split || '',
      playoffs: match.playoffs === 'true',
      team_kpm: parseFloat(match.teamKpm || '0') || 0,
      ckpm: parseFloat(match.ckpm || '0') || 0,
      first_blood: match.firstBlood || null,
      first_dragon: match.firstDragon || null,
      first_herald: match.firstHerald || null,
      first_baron: match.firstBaron || null,
      first_tower: match.firstTower || null,
      first_mid_tower: match.firstMidTower || null,
      first_three_towers: match.firstThreeTowers || null,
      
      // Initialize objective stats with zeros to ensure they're always present
      dragons: parseInt(match.dragons || '0') || 0,
      opp_dragons: parseInt(match.oppDragons || '0') || 0,
      elemental_drakes: parseInt(match.elementalDrakes || '0') || 0,
      opp_elemental_drakes: parseInt(match.oppElementalDrakes || '0') || 0,
      infernals: parseInt(match.infernals || '0') || 0,
      mountains: parseInt(match.mountains || '0') || 0,
      clouds: parseInt(match.clouds || '0') || 0,
      oceans: parseInt(match.oceans || '0') || 0,
      chemtechs: parseInt(match.chemtechs || '0') || 0,
      hextechs: parseInt(match.hextechs || '0') || 0,
      drakes_unknown: parseInt(match.drakesUnknown || '0') || 0,
      elders: parseInt(match.elders || '0') || 0,
      opp_elders: parseInt(match.oppElders || '0') || 0,
      heralds: parseInt(match.heralds || '0') || 0,
      opp_heralds: parseInt(match.oppHeralds || '0') || 0,
      barons: parseInt(match.barons || '0') || 0,
      opp_barons: parseInt(match.oppBarons || '0') || 0,
      void_grubs: parseInt(match.voidGrubs || '0') || 0,
      opp_void_grubs: parseInt(match.oppVoidGrubs || '0') || 0,
      towers: parseInt(match.towers || '0') || 0,
      opp_towers: parseInt(match.oppTowers || '0') || 0,
      turret_plates: parseInt(match.turretPlates || '0') || 0,
      opp_turret_plates: parseInt(match.oppTurretPlates || '0') || 0,
      inhibitors: parseInt(match.inhibitors || '0') || 0,
      opp_inhibitors: parseInt(match.oppInhibitors || '0') || 0,
      team_kills: parseInt(match.teamKills || '0') || 0,
      team_deaths: parseInt(match.teamDeaths || '0') || 0,
      
      // Include picks and bans
      picks: picksData || null,
      bans: bansData || null
    }
  };
  
  // Process blue team stats
  const blueTeamStats = teamStatsMap?.get(blueTeam.id);
  if (blueTeamStats) {
    console.log(`[matchProcessor] Match ${match.id} - Blue team stats extracted:`, {
      dragons: blueTeamStats.dragons,
      elemental_drakes: blueTeamStats.elemental_drakes,
      infernals: blueTeamStats.infernals,
      mountains: blueTeamStats.mountains,
      clouds: blueTeamStats.clouds,
      oceans: blueTeamStats.oceans,
      chemtechs: blueTeamStats.chemtechs,
      hextechs: blueTeamStats.hextechs,
      drakes_unknown: blueTeamStats.drakes_unknown,
      heralds: blueTeamStats.heralds,
      barons: blueTeamStats.barons,
      towers: blueTeamStats.towers,
      turret_plates: blueTeamStats.turret_plates,
      inhibitors: blueTeamStats.inhibitors,
      void_grubs: blueTeamStats.void_grubs
    });
    
    matchObject.extraStats.blueTeamStats = blueTeamStats;
  }
  
  // Process red team stats
  const redTeamStats = teamStatsMap?.get(redTeam.id);
  if (redTeamStats) {
    console.log(`[matchProcessor] Match ${match.id} - Red team stats extracted:`, {
      dragons: redTeamStats.dragons,
      elemental_drakes: redTeamStats.elemental_drakes,
      infernals: redTeamStats.infernals,
      mountains: redTeamStats.mountains,
      clouds: redTeamStats.clouds,
      oceans: redTeamStats.oceans,
      chemtechs: redTeamStats.chemtechs,
      hextechs: redTeamStats.hextechs,
      drakes_unknown: redTeamStats.drakes_unknown,
      heralds: redTeamStats.heralds,
      barons: redTeamStats.barons,
      towers: redTeamStats.towers,
      turret_plates: redTeamStats.turret_plates,
      inhibitors: redTeamStats.inhibitors,
      void_grubs: redTeamStats.void_grubs
    });
    
    matchObject.extraStats.redTeamStats = redTeamStats;
  }
  
  // Add result if the match is completed
  if (match.status === 'Completed' && match.winnerTeamId) {
    matchObject.result = {
      winner: match.winnerTeamId,
      score: [parseInt(match.scoreBlue || '0'), parseInt(match.scoreRed || '0')],
      duration: match.duration,
      mvp: match.mvp,
      firstBlood: match.firstBlood, 
      firstDragon: match.firstDragon,
      firstBaron: match.firstBaron,
      firstHerald: match.firstHerald,
      firstTower: match.firstTower
    };
  }
  
  return matchObject;
}
