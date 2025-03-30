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
  
  // Group data by game ID to process both teams together
  const rowsByGameId = new Map<string, LeagueGameDataRow[]>();
  data.forEach(row => {
    if (row.gameid) {
      const rows = rowsByGameId.get(row.gameid) || [];
      rows.push(row);
      rowsByGameId.set(row.gameid, rows);
    }
  });
  
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
    
    // Get game rows for this match to extract team positions
    const gameRows = rowsByGameId.get(match.id) || [];
    
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
    const blueTeamStats = processTeamRows(blueTeamRows, match.id, blueTeam.id, true);
    if (blueTeamStats) {
      matchObject.extraStats.blueTeamStats = blueTeamStats;
      // Add to team match stats array
      teamMatchStatsArray.push({
        ...blueTeamStats,
        match_id: match.id,
        team_id: blueTeam.id,
        side: 'blue'
      });
    }
    
    // Process red team stats
    const redTeamStats = processTeamRows(redTeamRows, match.id, redTeam.id, false);
    if (redTeamStats) {
      matchObject.extraStats.redTeamStats = redTeamStats;
      // Add to team match stats array
      teamMatchStatsArray.push({
        ...redTeamStats,
        match_id: match.id,
        team_id: redTeam.id,
        side: 'red'
      });
    }
    
    // Extraire statistiques spécifiques à chaque équipe
    const { blueTeamStats: extractedBlueStats, redTeamStats: extractedRedStats } = extractTeamSpecificStats(matchObject);
    
    // Ajouter aux statistiques d'équipe par match pour les deux équipes
    if (blueTeam && extractedBlueStats) {
      teamMatchStatsArray.push({
        ...extractedBlueStats,
        team_id: blueTeam.id,
        match_id: match.id,
        side: 'blue'
      });
    }
    
    if (redTeam && extractedRedStats) {
      teamMatchStatsArray.push({
        ...extractedRedStats,
        team_id: redTeam.id,
        match_id: match.id,
        side: 'red'
      });
    }
    
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
  
  // Helper function to process team rows
  function processTeamRows(rows: LeagueGameDataRow[], matchId: string, teamId: string, isBlue: boolean): any {
    if (rows.length === 0) {
      return null;
    }
    
    // Use the first row for team stats
    const row = rows[0];
    
    // Create team stats object
    return {
      team_id: teamId,
      match_id: matchId,
      is_blue_side: isBlue,
      team_kpm: parseFloat(row.team_kpm || '0') || 0,
      ckpm: parseFloat(row.ckpm || '0') || 0,
      kills: parseInt(row.teamkills || '0') || 0,
      deaths: parseInt(row.teamdeaths || '0') || 0,
      
      // Dragons
      dragons: parseInt(row.dragons || '0') || 0,
      elemental_drakes: parseInt(row.elementaldrakes || '0') || 0,
      infernals: parseInt(row.infernals || '0') || 0,
      mountains: parseInt(row.mountains || '0') || 0,
      clouds: parseInt(row.clouds || '0') || 0,
      oceans: parseInt(row.oceans || '0') || 0,
      chemtechs: parseInt(row.chemtechs || '0') || 0,
      hextechs: parseInt(row.hextechs || '0') || 0,
      drakes_unknown: parseInt(row.dragons_type_unknown || '0') || 0,
      
      // Other objectives
      elders: parseInt(row.elders || '0') || 0,
      heralds: parseInt(row.heralds || '0') || 0,
      barons: parseInt(row.barons || '0') || 0,
      towers: parseInt(row.towers || '0') || 0,
      turret_plates: parseInt(row.turretplates || '0') || 0,
      inhibitors: parseInt(row.inhibitors || '0') || 0,
      void_grubs: parseInt(row.void_grubs || '0') || 0,
      
      // First objectives
      first_blood: row.firstblood === 'True' || row.firstblood === '1',
      first_dragon: row.firstdragon === 'True' || row.firstdragon === '1',
      first_herald: row.firstherald === 'True' || row.firstherald === '1',
      first_baron: row.firstbaron === 'True' || row.firstbaron === '1',
      first_tower: row.firsttower === 'True' || row.firsttower === '1',
      first_mid_tower: row.firstmidtower === 'True' || row.firstmidtower === '1',
      first_three_towers: row.firsttothreetowers === 'True' || row.firsttothreetowers === '1'
    };
  }
  
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
  
  console.log(`Generated ${teamMatchStatsArray.length} team match statistics records`);
  
  // Return the assembled data
  return {
    teams,
    players,
    matches,
    playerMatchStats: playerMatchStatsArray,
    teamMatchStats: teamMatchStatsArray
  };
}
