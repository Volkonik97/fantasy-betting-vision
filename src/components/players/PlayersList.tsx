
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Player } from "@/utils/models/types";
import PlayerCard from "@/components/PlayerCard";
import { normalizeRoleName } from "@/utils/leagueData/assembler/modelConverter";

interface PlayersListProps {
  players: (Player & { teamName: string; teamRegion: string })[];
  loading: boolean;
}

const PlayersList = ({ players, loading }: PlayersListProps) => {
  // Log key information about the players we received
  console.log(`PlayersList: Received ${players.length} players`);
  
  if (loading) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Loading players...</p>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="col-span-full py-10 text-center">
        <p className="text-gray-500">No players found matching your filters.</p>
      </div>
    );
  }

  // Group players by region for debugging
  const regionCounts: Record<string, number> = {};
  players.forEach(player => {
    const region = player.teamRegion || 'Unknown';
    regionCounts[region] = (regionCounts[region] || 0) + 1;
  });
  console.log("Players by region in PlayersList:", regionCounts);

  // Log roles distribution
  const roleCounts: Record<string, number> = {};
  players.forEach(player => {
    const role = player.role || 'Unknown';
    roleCounts[role] = (roleCounts[role] || 0) + 1;
  });
  console.log("Players by role in PlayersList:", roleCounts);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {players.map((player, index) => (
        <motion.div
          key={player.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="h-full"
        >
          <Link to={`/players/${player.id}`} className="h-full block">
            <PlayerCard player={player} showTeamLogo={true} />
          </Link>
        </motion.div>
      ))}
    </div>
  );
};

export default PlayersList;
