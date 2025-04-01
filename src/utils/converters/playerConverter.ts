
import { PlayerCSV } from '../csv/types';
import { Player } from '../models/types';
import { normalizeRoleName } from '../leagueData/assembler/modelConverter';

/**
 * Convert player CSV data to application Player objects
 */
export const convertPlayerData = (playersCSV: PlayerCSV[]): Player[] => {
  return playersCSV.map(player => ({
    id: player.id,
    name: player.name,
    role: normalizeRoleName(player.role || 'Mid'),
    image: player.image,
    team: player.team,
    kda: parseFloat(player.kda) || 0,
    csPerMin: parseFloat(player.csPerMin) || 0,
    damageShare: parseFloat(player.damageShare) || 0,
    championPool: player.championPool ? player.championPool.split(',').map(champ => champ.trim()) : []
  }));
};
