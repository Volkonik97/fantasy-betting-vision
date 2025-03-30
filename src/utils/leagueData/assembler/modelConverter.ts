
import { Team, Player } from '../../models/types';

/**
 * Helper function to convert team CSV to team object
 */
export function teamToTeamObject(teamCsv: any): Team {
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
}

/**
 * Helper function to convert player CSV to player object
 */
export function playerToPlayerObject(playerCsv: any): Player {
  return {
    id: playerCsv.id,
    name: playerCsv.name,
    role: playerCsv.role as 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support',
    image: playerCsv.image,
    team: playerCsv.team,
    kda: parseFloat(playerCsv.kda) || 0,
    csPerMin: parseFloat(playerCsv.csPerMin) || 0,
    damageShare: parseFloat(playerCsv.damageShare) || 0,
    championPool: playerCsv.championPool ? playerCsv.championPool.split(',').map((champ: string) => champ.trim()) : []
  };
}
