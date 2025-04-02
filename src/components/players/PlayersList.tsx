
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Player } from "@/utils/models/types";
import PlayerCard from "@/components/PlayerCard";

interface PlayersListProps {
  players: (Player & { teamName: string; teamRegion: string })[];
  loading: boolean;
}

const PlayersList = ({ players, loading }: PlayersListProps) => {
  // Log detailed information about players on initial render and when players change
  useEffect(() => {
    console.log(`PlayersList: Received ${players.length} players`);
    
    // Log players by region
    const regionCounts = players.reduce((acc, player) => {
      const region = player.teamRegion || 'Unknown';
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log("Players by region:", regionCounts);
    
    // Log players by role
    const roleCounts = players.reduce((acc, player) => {
      const role = player.role || 'Unknown';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log("Players by role:", roleCounts);
    
    // Debug LCK players specifically
    const lckPlayers = players.filter(p => p.teamRegion === 'LCK');
    console.log(`Found ${lckPlayers.length} LCK players`);
    if (lckPlayers.length > 0) {
      console.log("Sample of LCK players:", 
        lckPlayers.slice(0, Math.min(5, lckPlayers.length)).map(p => ({
          name: p.name,
          role: p.role,
          team: p.teamName,
          region: p.teamRegion
        }))
      );
    }
  }, [players]);
  
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {players.map((player, index) => {
        // Make sure the player has all required data
        if (!player.id || !player.name) {
          console.warn("Invalid player data found:", player);
          return null;
        }
        
        // Ensure player has teamName and teamRegion (defensive coding)
        const enrichedPlayer = {
          ...player,
          teamName: player.teamName || "",
          teamRegion: player.teamRegion || ""
        };
        
        return (
          <motion.div
            key={player.id || index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="h-full"
          >
            <Link to={`/players/${player.id}`} className="h-full block">
              <PlayerCard player={enrichedPlayer} showTeamLogo={true} />
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
};

export default PlayersList;
