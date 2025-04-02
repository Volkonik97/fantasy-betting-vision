
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
  console.log(`PlayersList: Received ${players.length} players`);
  
  // Log all roles before normalization
  const rolesBefore = players.map(p => p.role);
  console.log("Roles before normalization:", rolesBefore);
  
  // Ensure all roles are normalized before rendering
  const normalizedPlayers = players.map(player => ({
    ...player,
    role: normalizeRoleName(player.role)
  }));
  
  // Log all roles after normalization
  const rolesAfter = normalizedPlayers.map(p => p.role);
  console.log("Roles after normalization:", rolesAfter);
  
  // Count players by role for debugging
  const roleCounts = normalizedPlayers.reduce((acc, player) => {
    const role = player.role;
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log("Player counts by role:", roleCounts);
  
  if (loading) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Loading players...</p>
      </div>
    );
  }

  if (normalizedPlayers.length === 0) {
    return (
      <div className="col-span-full py-10 text-center">
        <p className="text-gray-500">No players found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {normalizedPlayers.map((player, index) => (
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
