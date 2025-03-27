
import { LeagueGameDataRow, MatchCSV } from '../csvTypes';
import { 
  GameTracker, 
  MatchTeamStats, 
  PlayerMatchStats,
  parseBoolean,
  safeParseInt,
  safeParseFloat
} from './types';

// Process match data from League data rows
export function processMatchData(data: LeagueGameDataRow[]): {
  uniqueGames: Map<string, GameTracker>,
  matchStats: Map<string, Map<string, MatchTeamStats>>,
  matchPlayerStats: Map<string, Map<string, PlayerMatchStats>>,
  matchesArray: MatchCSV[]
} {
  // Create map for tracking game/match data
  const uniqueGames = new Map<string, GameTracker>();
  
  // Track match-level team statistics
  const matchStats = new Map<string, Map<string, MatchTeamStats>>();
  
  // Track player match statistics
  const matchPlayerStats = new Map<string, Map<string, PlayerMatchStats>>();
  
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
        playoffs: parseBoolean(row.playoffs),
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
    
    // Collect match-level team statistics
    if (row.teamid) {
      if (!matchStats.has(gameId)) {
        matchStats.set(gameId, new Map<string, MatchTeamStats>());
      }
      
      const teamStatsMap = matchStats.get(gameId)!;
      
      if (!teamStatsMap.has(row.teamid)) {
        teamStatsMap.set(row.teamid, {
          team_id: row.teamid,
          match_id: gameId,
          side: row.side || '',
          is_winner: row.result === '1',
          team_kpm: safeParseFloat(row['team kpm']),
          ckpm: safeParseFloat(row.ckpm),
          first_blood: parseBoolean(row.firstblood),
          team_kills: safeParseInt(row.teamkills),
          team_deaths: safeParseInt(row.teamdeaths),
          first_dragon: parseBoolean(row.firstdragon),
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
          first_herald: parseBoolean(row.firstherald),
          heralds: safeParseInt(row.heralds),
          opp_heralds: safeParseInt(row.opp_heralds),
          first_baron: parseBoolean(row.firstbaron),
          barons: safeParseInt(row.barons),
          opp_barons: safeParseInt(row.opp_barons),
          void_grubs: safeParseInt(row.void_grubs),
          opp_void_grubs: safeParseInt(row.opp_void_grubs),
          first_tower: parseBoolean(row.firsttower),
          first_mid_tower: parseBoolean(row.firstmidtower),
          first_three_towers: parseBoolean(row.firsttothreetowers),
          towers: safeParseInt(row.towers),
          opp_towers: safeParseInt(row.opp_towers),
          turret_plates: safeParseInt(row.turretplates),
          opp_turret_plates: safeParseInt(row.opp_turretplates),
          inhibitors: safeParseInt(row.inhibitors),
          opp_inhibitors: safeParseInt(row.opp_inhibitors)
        });
      }
    }
    
    // Collect detailed player stats for this match
    if (row.playerid && row.teamid) {
      // Initialize nested maps if they don't exist
      if (!matchPlayerStats.has(gameId)) {
        matchPlayerStats.set(gameId, new Map<string, PlayerMatchStats>());
      }
      
      const playersMap = matchPlayerStats.get(gameId)!;
      
      if (!playersMap.has(row.playerid)) {
        // Create a new player match stats entry
        const newPlayerMatchStat: PlayerMatchStats = {
          participant_id: row.participantid || '',
          player_id: row.playerid,
          team_id: row.teamid,
          match_id: gameId,
          side: row.side || '',
          position: row.position || '',
          champion: row.champion || '',
          
          // Important: Add the is_winner field based on the result column
          is_winner: row.result === '1',
          
          // Combat stats
          kills: safeParseInt(row.kills),
          deaths: safeParseInt(row.deaths),
          assists: safeParseInt(row.assists),
          double_kills: safeParseInt(row.doublekills),
          triple_kills: safeParseInt(row.triplekills),
          quadra_kills: safeParseInt(row.quadrakills),
          penta_kills: safeParseInt(row.pentakills),
          first_blood_kill: parseBoolean(row.firstbloodkill),
          first_blood_assist: parseBoolean(row.firstbloodassist),
          first_blood_victim: parseBoolean(row.firstbloodvictim),
          
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
          
          // Timeline stats: 10 min
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
          opp_deaths_at_25: safeParseInt(row.opp_deathsat25)
        };
        
        playersMap.set(row.playerid, newPlayerMatchStat);
      } else {
        // If this player already has stats for this match, update the result
        // This handles the case where result might be defined in different rows
        if (row.result === '1') {
          playersMap.get(row.playerid)!.is_winner = true;
        }
      }
    }
  });

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
        status: match.result ? 'Completed' : 'Upcoming'
      };
      
      if (match.result) {
        matchCSV.winnerTeamId = match.result;
        matchCSV.duration = match.duration;
      }
      
      return matchCSV;
    });

  return { uniqueGames, matchStats, matchPlayerStats, matchesArray };
}
