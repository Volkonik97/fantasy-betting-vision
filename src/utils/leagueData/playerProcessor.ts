
import { LeagueGameDataRow, PlayerCSV } from '../csvTypes';
import { 
  PlayerStatsTracker, 
  TeamGameDamageMap, 
  PlayerDamageSharesMap,
  safeParseInt,
  safeParseFloat
} from './types';

// Process player data from League data rows
export function processPlayerData(data: LeagueGameDataRow[]): {
  uniquePlayers: Map<string, PlayerCSV>,
  playerStats: Map<string, PlayerStatsTracker>,
  teamGameDamage: TeamGameDamageMap,
  playerDamageShares: PlayerDamageSharesMap
} {
  // Extract unique players
  const uniquePlayers = new Map<string, PlayerCSV>();
  data.forEach(row => {
    // Only add players with both a player ID and a team ID
    if (row.playerid && row.teamid && !uniquePlayers.has(row.playerid)) {
      uniquePlayers.set(row.playerid, {
        id: row.playerid,
        name: row.playername || row.playerid,
        role: row.position || 'Jungle',
        image: '',
        team: row.teamid,
        kda: '0',
        csPerMin: '0',
        damageShare: '0',
        championPool: ''
      });
    }
  });

  console.log(`Nombre de joueurs uniques identifiés: ${uniquePlayers.size}`);

  // Calculate player stats
  const playerStats = new Map<string, PlayerStatsTracker>();
  
  // First pass to collect player stats
  data.forEach(row => {
    if (!row.playerid || !row.teamid) return; // Skip rows without player ID or team ID
    
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
    stats.kills += safeParseInt(row.kills);
    stats.deaths += safeParseInt(row.deaths);
    stats.assists += safeParseInt(row.assists);
    stats.games++;
    
    const minionKills = safeParseInt(row.minionkills);
    const monsterKills = safeParseInt(row.monsterkills);
    stats.cs += minionKills + monsterKills;
    
    // Calculate damage
    const damageDone = safeParseInt(row.damagetochampions);
    stats.totalDamage += damageDone;
    
    if (row.champion) {
      stats.championsPlayed.add(row.champion);
    }
  });

  // Calculate team total damage for each game separately
  const teamGameDamage: TeamGameDamageMap = new Map();
  
  // First pass to calculate total team damage per game
  data.forEach(row => {
    if (!row.teamid || !row.playerid || !row.gameid) return;
    
    const teamId = row.teamid;
    const gameId = row.gameid;
    const damageDone = safeParseInt(row.damagetochampions);
    
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
  const playerDamageShares: PlayerDamageSharesMap = new Map();
  
  data.forEach(row => {
    if (!row.teamid || !row.playerid || !row.gameid) return;
    
    const playerId = row.playerid;
    const teamId = row.teamid;
    const gameId = row.gameid;
    const damageDone = safeParseInt(row.damagetochampions);
    
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
  
  // Update player stats with calculated averages
  playerDamageShares.forEach((damageShares, playerId) => {
    const player = uniquePlayers.get(playerId);
    if (player && damageShares.length > 0) {
      const avgDamageShare = damageShares.reduce((sum, share) => sum + share, 0) / damageShares.length;
      player.damageShare = avgDamageShare.toFixed(3);
    }
  });

  // Update player records with calculated statistics
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

  return { uniquePlayers, playerStats, teamGameDamage, playerDamageShares };
}
