
// Re-export player-related functionality for easier access
import { Player } from '@/utils/models/types';

export {
  getPlayers,
  getPlayerById,
  getPlayersByTeamId,
  savePlayers,
  clearPlayersCache
} from './services/playerService';

// Export a utility function to transform players for the player list
export const transformPlayersForList = (players: Player[]): (Player & { teamName: string; teamRegion: string })[] => {
  return players.map(player => ({
    ...player,
    teamName: player.teamName || "Unknown Team",
    teamRegion: player.teamRegion || "Unknown Region"
  }));
};

