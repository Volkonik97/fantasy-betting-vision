
import { LeagueGameDataRow, TeamCSV, PlayerCSV, MatchCSV } from './csvTypes';
import { Team, Player, Match } from './mockData';
import { convertTeamData, convertPlayerData, convertMatchData } from './dataConverter';

// Process League data and convert it to our application format
export const processLeagueData = (data: LeagueGameDataRow[]): {
  teams: Team[];
  players: Player[];
  matches: Match[];
} => {
  // Vérifier si les données sont valides
  if (!data || data.length === 0) {
    console.error("Aucune donnée League à traiter");
    return { teams: [], players: [], matches: [] };
  }
  
  console.log(`Traitement de ${data.length} lignes de données League`);
  
  const uniqueTeams = new Map<string, TeamCSV>();
  data.forEach(row => {
    if (row.teamid && !uniqueTeams.has(row.teamid)) {
      uniqueTeams.set(row.teamid, {
        id: row.teamid,
        name: row.teamname || row.teamid,
        logo: '',
        region: row.league || '',
        winRate: '0',
        blueWinRate: '0',
        redWinRate: '0',
        averageGameTime: '0'
      });
    }
  });

  console.log(`Nombre d'équipes uniques identifiées: ${uniqueTeams.size}`);

  const teamStats = new Map<string, { wins: number, losses: number, blueWins: number, blueLosses: number, redWins: number, redLosses: number, gameTimes: number[] }>();
  data.forEach(row => {
    if (!row.teamid) return;
    
    const teamId = row.teamid;
    if (!teamStats.has(teamId)) {
      teamStats.set(teamId, { wins: 0, losses: 0, blueWins: 0, blueLosses: 0, redWins: 0, redLosses: 0, gameTimes: [] });
    }
    
    const stats = teamStats.get(teamId)!;
    const isWin = row.result === '1';
    const gameLength = parseFloat(row.gamelength || '0');
    
    if (isWin) stats.wins++;
    else stats.losses++;
    
    if (row.side && row.side.toLowerCase() === 'blue') {
      if (isWin) stats.blueWins++;
      else stats.blueLosses++;
    } else if (row.side && row.side.toLowerCase() === 'red') {
      if (isWin) stats.redWins++;
      else stats.redLosses++;
    }
    
    if (!isNaN(gameLength)) {
      stats.gameTimes.push(gameLength);
    }
  });

  teamStats.forEach((stats, teamId) => {
    const team = uniqueTeams.get(teamId);
    if (team) {
      const totalGames = stats.wins + stats.losses;
      const blueGames = stats.blueWins + stats.blueLosses;
      const redGames = stats.redWins + stats.redLosses;
      
      team.winRate = totalGames > 0 ? (stats.wins / totalGames).toFixed(2) : '0';
      team.blueWinRate = blueGames > 0 ? (stats.blueWins / blueGames).toFixed(2) : '0';
      team.redWinRate = redGames > 0 ? (stats.redWins / redGames).toFixed(2) : '0';
      
      const avgGameTime = stats.gameTimes.length > 0 
        ? stats.gameTimes.reduce((sum, time) => sum + time, 0) / stats.gameTimes.length
        : 0;
      team.averageGameTime = avgGameTime.toFixed(1);
    }
  });

  const uniquePlayers = new Map<string, PlayerCSV>();
  data.forEach(row => {
    if (row.playerid && !uniquePlayers.has(row.playerid)) {
      uniquePlayers.set(row.playerid, {
        id: row.playerid,
        name: row.playername || row.playerid,
        role: row.position || 'Jungle',
        image: '',
        team: row.teamid || '',
        kda: '0',
        csPerMin: '0',
        damageShare: '0',
        championPool: ''
      });
    }
  });

  console.log(`Nombre de joueurs uniques identifiés: ${uniquePlayers.size}`);

  // Calculate player stats including damage share
  const playerStats = new Map<string, { 
    kills: number, 
    deaths: number, 
    assists: number, 
    games: number, 
    cs: number, 
    totalDamage: number,
    championsPlayed: Set<string> 
  }>();
  
  // First pass to collect player stats
  data.forEach(row => {
    if (!row.playerid) return;
    
    const playerId = row.playerid;
    if (!playerStats.has(playerId)) {
      playerStats.set(playerId, { 
        kills: 0, 
        deaths: 0, 
        assists: 0, 
        games: 0, 
        cs: 0, 
        totalDamage: 0,
        championsPlayed: new Set() 
      });
    }
    
    const stats = playerStats.get(playerId)!;
    stats.kills += parseInt(row.kills || '0') || 0;
    stats.deaths += parseInt(row.deaths || '0') || 0;
    stats.assists += parseInt(row.assists || '0') || 0;
    stats.games++;
    
    const minionKills = parseInt(row.minionkills || '0') || 0;
    const monsterKills = parseInt(row.monsterkills || '0') || 0;
    stats.cs += minionKills + monsterKills;
    
    // Calculate damage
    const damageDone = parseInt(row.damagetochampions || '0') || 0;
    stats.totalDamage += damageDone;
    
    if (row.champion) {
      stats.championsPlayed.add(row.champion);
    }
  });

  // Calculate team total damage for each game separately
  const teamGameDamage = new Map<string, Map<string, number>>();
  
  // First pass to calculate total team damage per game
  data.forEach(row => {
    if (!row.teamid || !row.playerid || !row.gameid) return;
    
    const teamId = row.teamid;
    const gameId = row.gameid;
    const damageDone = parseInt(row.damagetochampions || '0') || 0;
    
    // Create nested map structure if it doesn't exist
    if (!teamGameDamage.has(teamId)) {
      teamGameDamage.set(teamId, new Map<string, number>());
    }
    
    const teamGames = teamGameDamage.get(teamId)!;
    if (!teamGames.has(gameId)) {
      teamGames.set(gameId, 0);
    }
    
    // Add this player's damage to the team's total for this game
    teamGames.set(gameId, teamGames.get(gameId)! + damageDone);
  });
  
  // Calculate player damage share per game and average it
  const playerDamageShares = new Map<string, number[]>();
  
  data.forEach(row => {
    if (!row.teamid || !row.playerid || !row.gameid) return;
    
    const playerId = row.playerid;
    const teamId = row.teamid;
    const gameId = row.gameid;
    const damageDone = parseInt(row.damagetochampions || '0') || 0;
    
    // Get team's total damage for this game
    const teamGameMap = teamGameDamage.get(teamId);
    if (!teamGameMap) return;
    
    const teamGameTotalDamage = teamGameMap.get(gameId) || 0;
    if (teamGameTotalDamage <= 0) return;
    
    // Calculate damage share for this game
    const damageShare = damageDone / teamGameTotalDamage;
    
    // Store the damage share for averaging later
    if (!playerDamageShares.has(playerId)) {
      playerDamageShares.set(playerId, []);
    }
    
    playerDamageShares.get(playerId)!.push(damageShare);
  });
  
  // Update player stats with average damage share
  playerDamageShares.forEach((damageShares, playerId) => {
    const player = uniquePlayers.get(playerId);
    if (player && damageShares.length > 0) {
      const avgDamageShare = damageShares.reduce((sum, share) => sum + share, 0) / damageShares.length;
      player.damageShare = avgDamageShare.toFixed(3);
      console.log(`Player ${player.name} average damage share: ${avgDamageShare}`);
    }
  });

  // Second pass to calculate individual player stats
  playerStats.forEach((stats, playerId) => {
    const player = uniquePlayers.get(playerId);
    if (player) {
      // Calculate KDA
      const kda = stats.deaths > 0 ? ((stats.kills + stats.assists) / stats.deaths) : (stats.kills + stats.assists);
      player.kda = kda.toFixed(2);
      
      // Calculate CS per minute (assuming 30 min average game length if not available)
      const csPerMin = stats.games > 0 ? (stats.cs / stats.games / 30) : 0;
      player.csPerMin = csPerMin.toFixed(2);
      
      // Champion pool
      player.championPool = Array.from(stats.championsPlayed).join(',');
    }
  });

  // Create map for tracking match data
  const uniqueGames = new Map<string, {
    id: string,
    date: string,
    league: string,
    year: string,
    split: string,
    patch: string,
    playoffs: boolean,
    teams: { blue: string, red: string },
    result: string | undefined,
    duration: string | undefined,
  }>();
  
  // Prepare for detailed match & player stats
  const matchPlayerStats = new Map<string, Map<string, any>>();
  
  // Collect match data
  data.forEach(row => {
    if (!row.gameid) return;
    
    const gameId = row.gameid;
    
    if (!uniqueGames.has(gameId)) {
      uniqueGames.set(gameId, {
        id: gameId,
        date: row.date || new Date().toISOString(),
        league: row.league || '',
        year: row.year || '',
        split: row.split || '',
        patch: row.patch || '',
        playoffs: row.playoffs === 'yes' || row.playoffs === '1',
        teams: { blue: '', red: '' },
        result: undefined,
        duration: row.gamelength,
      });
    }
    
    const game = uniqueGames.get(gameId)!;
    
    // Track team sides
    if (row.side && row.side.toLowerCase() === 'blue' && row.teamid) {
      game.teams.blue = row.teamid;
    } else if (row.side && row.side.toLowerCase() === 'red' && row.teamid) {
      game.teams.red = row.teamid;
    }
    
    // Track game result
    if (row.result === '1' && row.teamid) {
      game.result = row.teamid;
    }
    
    // Collect detailed player stats for this match
    if (row.playerid && row.teamid) {
      // Initialize nested maps if they don't exist
      if (!matchPlayerStats.has(gameId)) {
        matchPlayerStats.set(gameId, new Map<string, any>());
      }
      
      const playersMap = matchPlayerStats.get(gameId)!;
      
      if (!playersMap.has(row.playerid)) {
        playersMap.set(row.playerid, {
          participant_id: row.participantid || '',
          player_id: row.playerid,
          team_id: row.teamid,
          match_id: gameId,
          side: row.side || '',
          position: row.position || '',
          champion: row.champion || '',
          
          // Combat stats
          kills: parseInt(row.kills || '0') || 0,
          deaths: parseInt(row.deaths || '0') || 0,
          assists: parseInt(row.assists || '0') || 0,
          double_kills: parseInt(row.doublekills || '0') || 0,
          triple_kills: parseInt(row.triplekills || '0') || 0,
          quadra_kills: parseInt(row.quadrakills || '0') || 0,
          penta_kills: parseInt(row.pentakills || '0') || 0,
          first_blood_kill: row.firstbloodkill === '1',
          first_blood_assist: row.firstbloodassist === '1',
          first_blood_victim: row.firstbloodvictim === '1',
          
          // Damage stats
          damage_to_champions: parseInt(row.damagetochampions || '0') || 0,
          dpm: parseFloat(row.dpm || '0') || 0,
          damage_share: parseFloat(row.damageshare || '0') || 0,
          damage_taken_per_minute: parseFloat(row.damagetakenperminute || '0') || 0,
          damage_mitigated_per_minute: parseFloat(row.damagemitigatedperminute || '0') || 0,
          
          // Vision stats
          wards_placed: parseInt(row.wardsplaced || '0') || 0,
          wpm: parseFloat(row.wpm || '0') || 0,
          wards_killed: parseInt(row.wardskilled || '0') || 0,
          wcpm: parseFloat(row.wcpm || '0') || 0,
          control_wards_bought: parseInt(row.controlwardsbought || '0') || 0,
          vision_score: parseInt(row.visionscore || '0') || 0,
          vspm: parseFloat(row.vspm || '0') || 0,
          
          // Gold stats
          total_gold: parseInt(row.totalgold || '0') || 0,
          earned_gold: parseInt(row.earnedgold || '0') || 0,
          earned_gpm: parseFloat(row['earned gpm'] || '0') || 0,
          earned_gold_share: parseFloat(row.earnedgoldshare || '0') || 0,
          gold_spent: parseInt(row.goldspent || '0') || 0,
          gspd: parseFloat(row.gspd || '0') || 0,
          gpr: parseFloat(row.gpr || '0') || 0,
          
          // CS stats
          total_cs: parseInt(row['total cs'] || '0') || 0,
          minion_kills: parseInt(row.minionkills || '0') || 0,
          monster_kills: parseInt(row.monsterkills || '0') || 0,
          monster_kills_own_jungle: parseInt(row.monsterkillsownjungle || '0') || 0,
          monster_kills_enemy_jungle: parseInt(row.monsterkillsenemyjungle || '0') || 0,
          cspm: parseFloat(row.cspm || '0') || 0,
          
          // Timeline stats: 10 min
          gold_at_10: parseInt(row.goldat10 || '0') || 0,
          xp_at_10: parseInt(row.xpat10 || '0') || 0,
          cs_at_10: parseInt(row.csat10 || '0') || 0,
          opp_gold_at_10: parseInt(row.opp_goldat10 || '0') || 0,
          opp_xp_at_10: parseInt(row.opp_xpat10 || '0') || 0,
          opp_cs_at_10: parseInt(row.opp_csat10 || '0') || 0,
          gold_diff_at_10: parseInt(row.golddiffat10 || '0') || 0,
          xp_diff_at_10: parseInt(row.xpdiffat10 || '0') || 0,
          cs_diff_at_10: parseInt(row.csdiffat10 || '0') || 0,
          kills_at_10: parseInt(row.killsat10 || '0') || 0,
          assists_at_10: parseInt(row.assistsat10 || '0') || 0,
          deaths_at_10: parseInt(row.deathsat10 || '0') || 0,
          opp_kills_at_10: parseInt(row.opp_killsat10 || '0') || 0,
          opp_assists_at_10: parseInt(row.opp_assistsat10 || '0') || 0,
          opp_deaths_at_10: parseInt(row.opp_deathsat10 || '0') || 0,
          
          // Timeline stats: 15 min
          gold_at_15: parseInt(row.goldat15 || '0') || 0,
          xp_at_15: parseInt(row.xpat15 || '0') || 0,
          cs_at_15: parseInt(row.csat15 || '0') || 0,
          opp_gold_at_15: parseInt(row.opp_goldat15 || '0') || 0,
          opp_xp_at_15: parseInt(row.opp_xpat15 || '0') || 0,
          opp_cs_at_15: parseInt(row.opp_csat15 || '0') || 0,
          gold_diff_at_15: parseInt(row.golddiffat15 || '0') || 0,
          xp_diff_at_15: parseInt(row.xpdiffat15 || '0') || 0,
          cs_diff_at_15: parseInt(row.csdiffat15 || '0') || 0,
          kills_at_15: parseInt(row.killsat15 || '0') || 0,
          assists_at_15: parseInt(row.assistsat15 || '0') || 0,
          deaths_at_15: parseInt(row.deathsat15 || '0') || 0,
          opp_kills_at_15: parseInt(row.opp_killsat15 || '0') || 0,
          opp_assists_at_15: parseInt(row.opp_assistsat15 || '0') || 0,
          opp_deaths_at_15: parseInt(row.opp_deathsat15 || '0') || 0,
          
          // Timeline stats: 20 min
          gold_at_20: parseInt(row.goldat20 || '0') || 0,
          xp_at_20: parseInt(row.xpat20 || '0') || 0,
          cs_at_20: parseInt(row.csat20 || '0') || 0,
          opp_gold_at_20: parseInt(row.opp_goldat20 || '0') || 0,
          opp_xp_at_20: parseInt(row.opp_xpat20 || '0') || 0,
          opp_cs_at_20: parseInt(row.opp_csat20 || '0') || 0,
          gold_diff_at_20: parseInt(row.golddiffat20 || '0') || 0,
          xp_diff_at_20: parseInt(row.xpdiffat20 || '0') || 0,
          cs_diff_at_20: parseInt(row.csdiffat20 || '0') || 0,
          kills_at_20: parseInt(row.killsat20 || '0') || 0,
          assists_at_20: parseInt(row.assistsat20 || '0') || 0,
          deaths_at_20: parseInt(row.deathsat20 || '0') || 0,
          opp_kills_at_20: parseInt(row.opp_killsat20 || '0') || 0,
          opp_assists_at_20: parseInt(row.opp_assistsat20 || '0') || 0,
          opp_deaths_at_20: parseInt(row.opp_deathsat20 || '0') || 0,
          
          // Timeline stats: 25 min
          gold_at_25: parseInt(row.goldat25 || '0') || 0,
          xp_at_25: parseInt(row.xpat25 || '0') || 0,
          cs_at_25: parseInt(row.csat25 || '0') || 0,
          opp_gold_at_25: parseInt(row.opp_goldat25 || '0') || 0,
          opp_xp_at_25: parseInt(row.opp_xpat25 || '0') || 0,
          opp_cs_at_25: parseInt(row.opp_csat25 || '0') || 0,
          gold_diff_at_25: parseInt(row.golddiffat25 || '0') || 0,
          xp_diff_at_25: parseInt(row.xpdiffat25 || '0') || 0,
          cs_diff_at_25: parseInt(row.csdiffat25 || '0') || 0,
          kills_at_25: parseInt(row.killsat25 || '0') || 0,
          assists_at_25: parseInt(row.assistsat25 || '0') || 0,
          deaths_at_25: parseInt(row.deathsat25 || '0') || 0,
          opp_kills_at_25: parseInt(row.opp_killsat25 || '0') || 0,
          opp_assists_at_25: parseInt(row.opp_assistsat25 || '0') || 0,
          opp_deaths_at_25: parseInt(row.opp_deathsat25 || '0') || 0,
        });
      }
    }
  });

  // Gather match-level statistics
  const matchStats = new Map<string, any>();
  
  data.forEach(row => {
    if (!row.gameid || !row.teamid) return;
    
    const gameId = row.gameid;
    const teamId = row.teamid;
    
    if (!matchStats.has(gameId)) {
      matchStats.set(gameId, new Map<string, any>());
    }
    
    const teamStats = matchStats.get(gameId)!;
    
    if (!teamStats.has(teamId)) {
      teamStats.set(teamId, {
        team_id: teamId,
        match_id: gameId,
        side: row.side || '',
        is_winner: row.result === '1',
        team_kpm: parseFloat(row['team kpm'] || '0') || 0,
        ckpm: parseFloat(row.ckpm || '0') || 0,
        first_blood: row.firstblood === '1',
        team_kills: parseInt(row.teamkills || '0') || 0,
        team_deaths: parseInt(row.teamdeaths || '0') || 0,
        
        // Dragon stats
        first_dragon: row.firstdragon === '1',
        dragons: parseInt(row.dragons || '0') || 0,
        opp_dragons: parseInt(row.opp_dragons || '0') || 0,
        elemental_drakes: parseInt(row.elementaldrakes || '0') || 0,
        opp_elemental_drakes: parseInt(row.opp_elementaldrakes || '0') || 0,
        infernals: parseInt(row.infernals || '0') || 0,
        mountains: parseInt(row.mountains || '0') || 0,
        clouds: parseInt(row.clouds || '0') || 0,
        oceans: parseInt(row.oceans || '0') || 0,
        chemtechs: parseInt(row.chemtechs || '0') || 0,
        hextechs: parseInt(row.hextechs || '0') || 0,
        drakes_unknown: parseInt(row['dragons (type unknown)'] || '0') || 0,
        elders: parseInt(row.elders || '0') || 0,
        opp_elders: parseInt(row.opp_elders || '0') || 0,
        
        // Herald and Baron
        first_herald: row.firstherald === '1',
        heralds: parseInt(row.heralds || '0') || 0,
        opp_heralds: parseInt(row.opp_heralds || '0') || 0,
        first_baron: row.firstbaron === '1',
        barons: parseInt(row.barons || '0') || 0,
        opp_barons: parseInt(row.opp_barons || '0') || 0,
        
        // New creatures
        void_grubs: parseInt(row.void_grubs || '0') || 0,
        opp_void_grubs: parseInt(row.opp_void_grubs || '0') || 0,
        
        // Tower stats
        first_tower: row.firsttower === '1',
        first_mid_tower: row.firstmidtower === '1',
        first_three_towers: row.firsttothreetowers === '1',
        towers: parseInt(row.towers || '0') || 0,
        opp_towers: parseInt(row.opp_towers || '0') || 0,
        turret_plates: parseInt(row.turretplates || '0') || 0,
        opp_turret_plates: parseInt(row.opp_turretplates || '0') || 0,
        inhibitors: parseInt(row.inhibitors || '0') || 0,
        opp_inhibitors: parseInt(row.opp_inhibitors || '0') || 0,
      });
    }
  });

  // Extraire tous les ID de matchs uniques  
  console.log(`Nombre de matchs uniques identifiés: ${uniqueGames.size}`);

  // Prepare match data for final conversion
  const matchesArray: MatchCSV[] = Array.from(uniqueGames.values())
    .filter(match => match.teams.blue && match.teams.red) // Make sure both teams are defined
    .map(match => {
      const matchCSV: MatchCSV = {
        id: match.id,
        tournament: `${match.league || 'Unknown'} ${match.year || ''} ${match.split || ''}`,
        date: match.date,
        teamBlueId: match.teams.blue,
        teamRedId: match.teams.red,
        predictedWinner: match.teams.blue, // Default predicted winner to blue side
        blueWinOdds: '0.5',
        redWinOdds: '0.5',
        status: match.result ? 'Completed' : 'Upcoming',
        // Add new fields for the expanded matches table
        patch: match.patch,
        year: match.year,
        split: match.split,
        playoffs: match.playoffs ? 'yes' : 'no'
      };
      
      if (match.result) {
        matchCSV.winnerTeamId = match.result;
        matchCSV.duration = match.duration;
      }
      
      return matchCSV;
    });
  
  console.log(`Conversion finale en ${matchesArray.length} matchs`);
  const teams = Array.from(uniqueTeams.values());
  const teamsConverted = convertTeamData(teams);
  
  const players = Array.from(uniquePlayers.values());
  const playersConverted = convertPlayerData(players);
  
  teamsConverted.forEach(team => {
    team.players = playersConverted.filter(player => player.team === team.id);
  });
  
  const matchesConverted = convertMatchData(matchesArray, teamsConverted);
  
  // Add additional data to prepare for detailed player match stats
  matchesConverted.forEach(match => {
    // Add match-level stats if available
    const matchTeamStats = matchStats.get(match.id);
    if (matchTeamStats) {
      const blueTeamStats = matchTeamStats.get(match.teamBlue.id);
      const redTeamStats = matchTeamStats.get(match.teamRed.id);
      
      if (blueTeamStats) {
        match.extraStats = {
          ...match.extraStats,
          blueTeamStats
        };
      }
      
      if (redTeamStats) {
        match.extraStats = {
          ...match.extraStats,
          redTeamStats
        };
      }
    }
    
    // Add player match stats if available
    const playerStats = matchPlayerStats.get(match.id);
    if (playerStats) {
      match.playerStats = Array.from(playerStats.values());
    }
  });
  
  return {
    teams: teamsConverted,
    players: playersConverted,
    matches: matchesConverted
  };
};
