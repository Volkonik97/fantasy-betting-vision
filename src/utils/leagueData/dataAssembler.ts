
import { LeagueGameDataRow } from '../csv/types';
import { Match, Player, Team } from '../models/types';
import { processMatchData } from './match/matchProcessor';
import { processTeamData } from './teamProcessor';
import { processPlayerData } from './playerProcessor';
import { extractPicksAndBans } from './match/picksAndBansExtractor';

export function assembleLeagueData(data: LeagueGameDataRow[]): {
  teams: Team[];
  players: Player[];
  matches: Match[];
  playerMatchStats: any[];
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
    };
    
    // Add extra stats from the Oracle's Elixir data
    if (teamStatsMap) {
      // Get blue team stats
      const blueTeamStats = teamStatsMap.get(match.teamBlueId);
      // Get red team stats
      const redTeamStats = teamStatsMap.get(match.teamRedId);
      
      console.log(`Match ${match.id} team stats:`, { 
        hasBlueStats: !!blueTeamStats, 
        hasRedStats: !!redTeamStats 
      });
      
      // Always create extraStats object, even if no team stats available
      matchObject.extraStats = {
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
        dragons: 0,
        opp_dragons: 0,
        elemental_drakes: 0,
        opp_elemental_drakes: 0,
        infernals: 0,
        mountains: 0,
        clouds: 0,
        oceans: 0,
        chemtechs: 0,
        hextechs: 0,
        drakes_unknown: 0,
        elders: 0,
        opp_elders: 0,
        heralds: 0,
        opp_heralds: 0,
        barons: 0,
        opp_barons: 0,
        void_grubs: 0,
        opp_void_grubs: 0,
        towers: 0,
        opp_towers: 0,
        turret_plates: 0,
        opp_turret_plates: 0,
        inhibitors: 0,
        opp_inhibitors: 0,
        team_kills: 0,
        team_deaths: 0,
        
        // Include picks and bans
        picks: picksData,
        bans: bansData
      };
      
      // If blue team stats exist, use them
      if (blueTeamStats) {
        matchObject.extraStats = {
          ...matchObject.extraStats,
          team_kpm: blueTeamStats.team_kpm || 0,
          ckpm: blueTeamStats.ckpm || 0,
          first_blood: blueTeamStats.first_blood || null,
          first_dragon: blueTeamStats.first_dragon || null,
          first_herald: blueTeamStats.first_herald || null,
          first_baron: blueTeamStats.first_baron || null,
          first_tower: blueTeamStats.first_tower || null,
          first_mid_tower: blueTeamStats.first_mid_tower || null,
          first_three_towers: blueTeamStats.first_three_towers || null,
          dragons: blueTeamStats.dragons || 0,
          opp_dragons: blueTeamStats.opp_dragons || 0,
          elemental_drakes: blueTeamStats.elemental_drakes || 0,
          opp_elemental_drakes: blueTeamStats.opp_elemental_drakes || 0,
          infernals: blueTeamStats.infernals || 0,
          mountains: blueTeamStats.mountains || 0,
          clouds: blueTeamStats.clouds || 0,
          oceans: blueTeamStats.oceans || 0,
          chemtechs: blueTeamStats.chemtechs || 0,
          hextechs: blueTeamStats.hextechs || 0,
          drakes_unknown: blueTeamStats.drakes_unknown || 0,
          elders: blueTeamStats.elders || 0,
          opp_elders: blueTeamStats.opp_elders || 0,
          heralds: blueTeamStats.heralds || 0,
          opp_heralds: blueTeamStats.opp_heralds || 0,
          barons: blueTeamStats.barons || 0,
          opp_barons: blueTeamStats.opp_barons || 0,
          void_grubs: blueTeamStats.void_grubs || 0,
          opp_void_grubs: blueTeamStats.opp_void_grubs || 0,
          towers: blueTeamStats.towers || 0,
          opp_towers: blueTeamStats.opp_towers || 0,
          turret_plates: blueTeamStats.turret_plates || 0,
          opp_turret_plates: blueTeamStats.opp_turret_plates || 0,
          inhibitors: blueTeamStats.inhibitors || 0,
          opp_inhibitors: blueTeamStats.opp_inhibitors || 0,
          team_kills: blueTeamStats.team_kills || 0,
          team_deaths: blueTeamStats.team_deaths || 0,
          blueTeamStats: blueTeamStats || {},
          redTeamStats: redTeamStats || {}
        };
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
    playerMatchStats: playerMatchStatsArray
  };
}
