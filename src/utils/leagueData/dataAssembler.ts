
import { LeagueGameDataRow } from '../csv/types';
import { Match, Player, Team } from '../models/types';
import { processMatchData } from './match/matchProcessor';
import { processTeamData } from './teamProcessor';
import { processPlayerData } from './playerProcessor';
import { extractPicksAndBans } from './match/picksAndBansExtractor';
import { extractTeamSpecificStats } from '../database/matches/teamStatsExtractor';

export function assembleLeagueData(data: LeagueGameDataRow[]): {
  teams: Team[];
  players: Player[];
  matches: Match[];
  playerMatchStats: any[];
  teamMatchStats: any[];
} {
  console.log(`Assembling League data from ${data.length} rows...`);
  
  // Process match data to get games, team stats, and player stats
  const { uniqueGames, matchStats, matchPlayerStats, matchesArray } = processMatchData(data);
  
  // Process team statistics
  const { uniqueTeams, teamStats } = processTeamData(data);
  
  // Process player statistics
  const { uniquePlayers, playerStats, teamGameDamage, playerDamageShares } = processPlayerData(data);
  
  // Convert the maps to arrays for the return object
  const teams: Team[] = Array.from(uniqueTeams.values()).map(teamCsv => {
    return {
      id: teamCsv.id,
      name: teamCsv.name,
      logo: teamCsv.logo,
      region: teamCsv.region,
      winRate: parseFloat(teamCsv.winRate) || 0,
      blueWinRate: parseFloat(teamCsv.blueWinRate) || 0,
      redWinRate: parseFloat(teamCsv.redWinRate) || 0,
      averageGameTime: parseFloat(teamCsv.averageGameTime) || 0,
      players: [] // Will be filled later
    };
  });
  
  // Convert the maps to arrays for the return object
  const players: Player[] = Array.from(uniquePlayers.values()).map(playerCsv => {
    return {
      id: playerCsv.id,
      name: playerCsv.name,
      role: playerCsv.role as 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support',
      image: playerCsv.image,
      team: playerCsv.team,
      kda: parseFloat(playerCsv.kda) || 0,
      csPerMin: parseFloat(playerCsv.csPerMin) || 0,
      damageShare: parseFloat(playerCsv.damageShare) || 0,
      championPool: playerCsv.championPool ? playerCsv.championPool.split(',').map(champ => champ.trim()) : []
    };
  });
  
  // Préparation des tableaux pour les statistiques d'équipe par match
  const teamMatchStatsArray: any[] = [];
  
  // Convert the matchesArray to Match objects
  const matches: Match[] = matchesArray.map(match => {
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
    const gameRows = data.filter(row => row.gameid === match.id);
    const { picks: picksData, bans: bansData } = extractPicksAndBans(gameRows);
    
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
    
    // Extraire statistiques spécifiques à chaque équipe
    const { blueTeamStats, redTeamStats } = extractTeamSpecificStats(matchObject);
    
    // Ajouter aux statistiques d'équipe par match pour les deux équipes
    teamMatchStatsArray.push({
      ...blueTeamStats,
      match_id: match.id,
      side: 'blue'
    });
    
    teamMatchStatsArray.push({
      ...redTeamStats,
      match_id: match.id,
      side: 'red'
    });
    
    // Ajouter les stats d'équipe à l'objet match pour la rétrocompatibilité
    if (teamStatsMap) {
      const blueTeamStats = teamStatsMap.get(blueTeam.id);
      const redTeamStats = teamStatsMap.get(redTeam.id);
      
      if (blueTeamStats) {
        matchObject.extraStats.blueTeamStats = blueTeamStats;
      }
      
      if (redTeamStats) {
        matchObject.extraStats.redTeamStats = redTeamStats;
      }
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
  }).filter(Boolean) as Match[];
  
  // Collect player match statistics as array
  const playerMatchStatsArray: any[] = [];
  matchPlayerStats.forEach((playerMap, matchId) => {
    playerMap.forEach((stats, playerId) => {
      playerMatchStatsArray.push({
        ...stats,
        participant_id: `${playerId}_${matchId}`,
        player_id: playerId,
        match_id: matchId
      });
    });
  });
  
  // Return the assembled data
  return {
    teams,
    players,
    matches,
    playerMatchStats: playerMatchStatsArray,
    teamMatchStats: teamMatchStatsArray
  };
}
