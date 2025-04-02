
import React, { useEffect } from "react";
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
  // Make sure we have players to display
  useEffect(() => {
    console.log(`PlayersList: Received ${players?.length || 0} players`);
    if (players?.length > 0) {
      // Log the first few players for debugging
      players.slice(0, 5).forEach(player => {
        console.log(`Player in list: ${player.name}, Role: ${player.role}, Team: ${player.teamName}`);
      });
      
      // Count players by role
      const roleCounts = players.reduce((acc, player) => {
        const normalizedRole = normalizeRoleName(player.role);
        acc[normalizedRole] = (acc[normalizedRole] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log("Players by role:", roleCounts);
    }
  }, [players]);
  
  // Ensure all roles are normalized before rendering
  const normalizedPlayers = players.map(player => ({
    ...player,
    role: normalizeRoleName(player.role)
  }));
  
  // Log player counts by role for debugging
  const roleCounts = normalizedPlayers.reduce((acc, player) => {
    acc[player.role] = (acc[player.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log("Filtered players by role:", roleCounts);
  
  // Log specific players for debugging
  const topPlayers = normalizedPlayers.filter(p => p.role === 'Top');
  console.log("Top players:", topPlayers.map(p => `${p.name} (${p.teamName})`));
  
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
