
import { LeagueGameDataRow, MatchCSV } from '../csvTypes';
import { 
  GameTracker, 
  MatchTeamStats, 
  PlayerMatchStats,
  parseBoolean,
  safeParseInt,
  safeParseFloat
} from './types';

// Process match data from League data rows with improved efficiency
export function processMatchData(data: LeagueGameDataRow[]): {
  uniqueGames: Map<string, GameTracker>,
  matchStats: Map<string, Map<string, MatchTeamStats>>,
  matchPlayerStats: Map<string, Map<string, PlayerMatchStats>>,
  matchesArray: MatchCSV[]
} {
  console.log(`Processing ${data.length} rows of match data...`);
  
  // Create map for tracking game/match data
  const uniqueGames = new Map<string, GameTracker>();
  
  // Track match-level team statistics
  const matchStats = new Map<string, Map<string, MatchTeamStats>>();
  
  // Track player match statistics
  const matchPlayerStats = new Map<string, Map<string, PlayerMatchStats>>();
  
  // Pre-process the data and group by game ID for faster processing
  const gameIdGroups = new Map<string, LeagueGameDataRow[]>();
  
  // Group data by game ID for batch processing
  data.forEach(row => {
    if (!row.gameid) return;
    
    if (!gameIdGroups.has(row.gameid)) {
      gameIdGroups.set(row.gameid, []);
    }
    
    gameIdGroups.get(row.gameid)!.push(row);
  });
  
  console.log(`Found ${gameIdGroups.size} unique games to process`);
  
  // Process each game with all its rows at once
  gameIdGroups.forEach((gameRows, gameId) => {
    // Initialize game data
    let game: GameTracker = {
      id: gameId,
      date: gameRows[0].date || new Date().toISOString(),
      league: gameRows[0].league || '',
      year: gameRows[0].year || '',
      split: gameRows[0].split || '',
      patch: gameRows[0].patch || '',
      playoffs: parseBoolean(gameRows[0].playoffs),
      teams: { blue: '', red: '' },
      result: undefined,
      duration: gameRows[0].gamelength,
    };
    
    // Initialize team stats maps
    const teamStatsMap = new Map<string, MatchTeamStats>();
    const playerStatsMap = new Map<string, PlayerMatchStats>();
    
    // Ensure we convert objective ownership data correctly
    let blueTeamId = '';
    let redTeamId = '';
    
    // Process all rows for this game at once
    gameRows.forEach(row => {
      // Track team sides for objective attribution
      if (row.side && row.side.toLowerCase() === 'blue' && row.teamid) {
        game.teams.blue = row.teamid;
        blueTeamId = row.teamid;
      } else if (row.side && row.side.toLowerCase() === 'red' && row.teamid) {
        game.teams.red = row.teamid;
        redTeamId = row.teamid;
      }
      
      // Track game result
      if (row.result === '1' && row.teamid) {
        game.result = row.teamid;
      }
      
      // Collect match-level team statistics
      if (row.teamid && !teamStatsMap.has(row.teamid)) {
        // Determine which team got the first blood/dragon/baron/etc.
        // For first objectives, we need to ensure the values are team IDs and not true/false
        let firstBloodTeam = null;
        let firstDragonTeam = null;
        let firstHeraldTeam = null;
        let firstBaronTeam = null;
        let firstTowerTeam = null;
        
        // If row has firstblood=1, then this team got first blood
        if (row.firstblood === '1' || row.firstblood === 'TRUE' || row.firstblood === 'true') {
          firstBloodTeam = row.teamid;
        }
        
        // Similarly for other objectives
        if (row.firstdragon === '1' || row.firstdragon === 'TRUE' || row.firstdragon === 'true') {
          firstDragonTeam = row.teamid;
        }
        
        if (row.firstherald === '1' || row.firstherald === 'TRUE' || row.firstherald === 'true') {
          firstHeraldTeam = row.teamid;
        }
        
        if (row.firstbaron === '1' || row.firstbaron === 'TRUE' || row.firstbaron === 'true') {
          firstBaronTeam = row.teamid;
        }
        
        if (row.firsttower === '1' || row.firsttower === 'TRUE' || row.firsttower === 'true') {
          firstTowerTeam = row.teamid;
        }
        
        teamStatsMap.set(row.teamid, {
          team_id: row.teamid,
          match_id: gameId,
          side: row.side || '',
          is_winner: row.result === '1',
          team_kpm: safeParseFloat(row['team kpm']),
          ckpm: safeParseFloat(row.ckpm),
          first_blood: firstBloodTeam,
          team_kills: safeParseInt(row.teamkills),
          team_deaths: safeParseInt(row.teamdeaths),
          first_dragon: firstDragonTeam,
          dragons: safeParseInt(row.dragons),
          opp_dragons: safeParseInt(row.opp_dragons),
          elemental_drakes: safeParseInt(row.elementaldrakes),
          opp_elemental_drakes: safeParseInt(row.opp_elementaldrakes),
          infernals: safeParseInt(row.infernals),
          mountains: safeParseInt(row.mountains),
          clouds: safeParseInt(row.clouds),
          oceans: safeParseInt(row.oceans),
          chemtechs: safeParseInt(row.chemtechs),
          hextechs: safeParseInt(row.hextechs),
          drakes_unknown: safeParseInt(row['dragons (type unknown)']),
          elders: safeParseInt(row.elders),
          opp_elders: safeParseInt(row.opp_elders),
          first_herald: firstHeraldTeam,
          heralds: safeParseInt(row.heralds),
          opp_heralds: safeParseInt(row.opp_heralds),
          first_baron: firstBaronTeam,
          barons: safeParseInt(row.barons),
          opp_barons: safeParseInt(row.opp_barons),
          void_grubs: safeParseInt(row.void_grubs),
          opp_void_grubs: safeParseInt(row.opp_void_grubs),
          first_tower: firstTowerTeam,
          first_mid_tower: row.firstmidtower === '1' ? row.teamid : null,
          first_three_towers: row.firsttothreetowers === '1' ? row.teamid : null,
          towers: safeParseInt(row.towers),
          opp_towers: safeParseInt(row.opp_towers),
          turret_plates: safeParseInt(row.turretplates),
          opp_turret_plates: safeParseInt(row.opp_turretplates),
          inhibitors: safeParseInt(row.inhibitors),
          opp_inhibitors: safeParseInt(row.opp_inhibitors)
        });
      }
      
      // Collect detailed player stats for this match
      if (row.playerid && row.teamid && !playerStatsMap.has(row.playerid)) {
        // Handle first blood participation for player stats
        const firstBloodKill = parseBoolean(row.firstbloodkill);
        const firstBloodAssist = parseBoolean(row.firstbloodassist);
        const firstBloodVictim = parseBoolean(row.firstbloodvictim);
        
        // Create a new player match stats entry
        playerStatsMap.set(row.playerid, {
          participant_id: row.participantid || `${row.playerid}_${gameId}`,
          player_id: row.playerid,
          team_id: row.teamid,
          match_id: gameId,
          side: row.side || '',
          position: row.position || '',
          champion: row.champion || '',
          
          // Set is_winner based on the result column
          is_winner: row.result === '1',
          
          // Combat stats - correctly handle first blood stats
          kills: safeParseInt(row.kills),
          deaths: safeParseInt(row.deaths),
          assists: safeParseInt(row.assists),
          double_kills: safeParseInt(row.doublekills),
          triple_kills: safeParseInt(row.triplekills),
          quadra_kills: safeParseInt(row.quadrakills),
          penta_kills: safeParseInt(row.pentakills),
          first_blood_kill: firstBloodKill,
          first_blood_assist: firstBloodAssist,
          first_blood_victim: firstBloodVictim,
          
          // Damage stats
          damage_to_champions: safeParseInt(row.damagetochampions),
          dpm: safeParseFloat(row.dpm),
          damage_share: safeParseFloat(row.damageshare),
          damage_taken_per_minute: safeParseFloat(row.damagetakenperminute),
          damage_mitigated_per_minute: safeParseFloat(row.damagemitigatedperminute),
          
          // Vision stats
          wards_placed: safeParseInt(row.wardsplaced),
          wpm: safeParseFloat(row.wpm),
          wards_killed: safeParseInt(row.wardskilled),
          wcpm: safeParseFloat(row.wcpm),
          control_wards_bought: safeParseInt(row.controlwardsbought),
          vision_score: safeParseInt(row.visionscore),
          vspm: safeParseFloat(row.vspm),
          
          // Gold stats
          total_gold: safeParseInt(row.totalgold),
          earned_gold: safeParseInt(row.earnedgold),
          earned_gpm: safeParseFloat(row['earned gpm']),
          earned_gold_share: safeParseFloat(row.earnedgoldshare),
          gold_spent: safeParseInt(row.goldspent),
          gspd: safeParseFloat(row.gspd),
          gpr: safeParseFloat(row.gpr),
          
          // CS stats
          total_cs: safeParseInt(row['total cs']),
          minion_kills: safeParseInt(row.minionkills),
          monster_kills: safeParseInt(row.monsterkills),
          monster_kills_own_jungle: safeParseInt(row.monsterkillsownjungle),
          monster_kills_enemy_jungle: safeParseInt(row.monsterkillsenemyjungle),
          cspm: safeParseFloat(row.cspm),
          
          // Timeline stats
          gold_at_10: safeParseInt(row.goldat10),
          xp_at_10: safeParseInt(row.xpat10),
          cs_at_10: safeParseInt(row.csat10),
          opp_gold_at_10: safeParseInt(row.opp_goldat10),
          opp_xp_at_10: safeParseInt(row.opp_xpat10),
          opp_cs_at_10: safeParseInt(row.opp_csat10),
          gold_diff_at_10: safeParseInt(row.golddiffat10),
          xp_diff_at_10: safeParseInt(row.xpdiffat10),
          cs_diff_at_10: safeParseInt(row.csdiffat10),
          kills_at_10: safeParseInt(row.killsat10),
          assists_at_10: safeParseInt(row.assistsat10),
          deaths_at_10: safeParseInt(row.deathsat10),
          opp_kills_at_10: safeParseInt(row.opp_killsat10),
          opp_assists_at_10: safeParseInt(row.opp_assistsat10),
          opp_deaths_at_10: safeParseInt(row.opp_deathsat10),
          
          // Timeline stats: 15 min
          gold_at_15: safeParseInt(row.goldat15),
          xp_at_15: safeParseInt(row.xpat15),
          cs_at_15: safeParseInt(row.csat15),
          opp_gold_at_15: safeParseInt(row.opp_goldat15),
          opp_xp_at_15: safeParseInt(row.opp_xpat15),
          opp_cs_at_15: safeParseInt(row.opp_csat15),
          gold_diff_at_15: safeParseInt(row.golddiffat15),
          xp_diff_at_15: safeParseInt(row.xpdiffat15),
          cs_diff_at_15: safeParseInt(row.csdiffat15),
          kills_at_15: safeParseInt(row.killsat15),
          assists_at_15: safeParseInt(row.assistsat15),
          deaths_at_15: safeParseInt(row.deathsat15),
          opp_kills_at_15: safeParseInt(row.opp_killsat15),
          opp_assists_at_15: safeParseInt(row.opp_assistsat15),
          opp_deaths_at_15: safeParseInt(row.opp_deathsat15),
          
          // Timeline stats: 20 min
          gold_at_20: safeParseInt(row.goldat20),
          xp_at_20: safeParseInt(row.xpat20),
          cs_at_20: safeParseInt(row.csat20),
          opp_gold_at_20: safeParseInt(row.opp_goldat20),
          opp_xp_at_20: safeParseInt(row.opp_xpat20),
          opp_cs_at_20: safeParseInt(row.opp_csat20),
          gold_diff_at_20: safeParseInt(row.golddiffat20),
          xp_diff_at_20: safeParseInt(row.xpdiffat20),
          cs_diff_at_20: safeParseInt(row.csdiffat20),
          kills_at_20: safeParseInt(row.killsat20),
          assists_at_20: safeParseInt(row.assistsat20),
          deaths_at_20: safeParseInt(row.deathsat20),
          opp_kills_at_20: safeParseInt(row.opp_killsat20),
          opp_assists_at_20: safeParseInt(row.opp_assistsat20),
          opp_deaths_at_20: safeParseInt(row.opp_deathsat20),
          
          // Timeline stats: 25 min
          gold_at_25: safeParseInt(row.goldat25),
          xp_at_25: safeParseInt(row.xpat25),
          cs_at_25: safeParseInt(row.csat25),
          opp_gold_at_25: safeParseInt(row.opp_goldat25),
          opp_xp_at_25: safeParseInt(row.opp_xpat25),
          opp_cs_at_25: safeParseInt(row.opp_csat25),
          gold_diff_at_25: safeParseInt(row.golddiffat25),
          xp_diff_at_25: safeParseInt(row.xpdiffat25),
          cs_diff_at_25: safeParseInt(row.csdiffat25),
          kills_at_25: safeParseInt(row.killsat25),
          assists_at_25: safeParseInt(row.assistsat25),
          deaths_at_25: safeParseInt(row.deathsat25),
          opp_kills_at_25: safeParseInt(row.opp_killsat25),
          opp_assists_at_25: safeParseInt(row.opp_assistsat25),
          opp_deaths_at_25: safeParseInt(row.opp_deathsat25),
        });
      }
    });
    
    // Add the complete game data to our maps
    uniqueGames.set(gameId, game);
    
    // Add the team stats to the match stats map
    matchStats.set(gameId, teamStatsMap);
    
    // Add the player stats to the match player stats map
    matchPlayerStats.set(gameId, playerStatsMap);
  });
  
  // Convert the maps to arrays for the return object
  const matchesArray: MatchCSV[] = [];
  
  uniqueGames.forEach(match => {
    // Find first blood holder for this match
    const teamStatsMap = matchStats.get(match.id);
    let firstBlood = '';
    let firstDragon = '';
    let firstHerald = '';
    let firstBaron = '';
    let firstTower = '';
    
    if (teamStatsMap) {
      teamStatsMap.forEach(teamStats => {
        // Check if this team got any first objectives
        if (teamStats.first_blood === teamStats.team_id) {
          firstBlood = teamStats.team_id;
        }
        if (teamStats.first_dragon === teamStats.team_id) {
          firstDragon = teamStats.team_id;
        }
        if (teamStats.first_herald === teamStats.team_id) {
          firstHerald = teamStats.team_id;
        }
        if (teamStats.first_baron === teamStats.team_id) {
          firstBaron = teamStats.team_id;
        }
        if (teamStats.first_tower === teamStats.team_id) {
          firstTower = teamStats.team_id;
        }
      });
    }
    
    matchesArray.push({
      id: match.id,
      tournament: match.league,
      date: match.date,
      teamBlueId: match.teams.blue,
      teamRedId: match.teams.red,
      predictedWinner: match.teams.blue, // Default to blue team
      blueWinOdds: '0.5',
      redWinOdds: '0.5',
      status: match.result ? 'Completed' : 'Upcoming',
      firstBlood: firstBlood,
      firstDragon: firstDragon,
      firstHerald: firstHerald,
      firstBaron: firstBaron,
      firstTower: firstTower,
      patch: match.patch,
      year: match.year,
      split: match.split,
      playoffs: match.playoffs ? 'true' : 'false'
    });
    
    if (match.result) {
      matchesArray[matchesArray.length - 1].winnerTeamId = match.result;
      
      // Set scores
      if (match.result === match.teams.blue) {
        matchesArray[matchesArray.length - 1].scoreBlue = '1';
        matchesArray[matchesArray.length - 1].scoreRed = '0';
      } else if (match.result === match.teams.red) {
        matchesArray[matchesArray.length - 1].scoreBlue = '0';
        matchesArray[matchesArray.length - 1].scoreRed = '1';
      }
      
      // Set duration
      if (match.duration) {
        matchesArray[matchesArray.length - 1].duration = match.duration;
      }
    }
  });
  
  console.log(`Processed ${uniqueGames.size} matches, ${matchPlayerStats.size} player stats groups`);
  
  return {
    uniqueGames,
    matchStats,
    matchPlayerStats, 
    matchesArray
  };
}
