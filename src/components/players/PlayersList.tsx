
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Player } from "@/utils/models/types";
import PlayerCard from "@/components/PlayerCard";

interface PlayersListProps {
  players: (Player & { teamName: string; teamRegion: string })[];
  loading: boolean;
}

const PlayersList = ({ players, loading }: PlayersListProps) => {
  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-lol-blue mb-4"></div>
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

  // Log des joueurs pour debug
  console.log(`Rendering ${players.length} players in PlayersList`);
  if (players.length > 0) {
    console.log("Sample player data:", players[0]);
    
    // Vérifier les joueurs de Hanwha Life Esports
    const hanwhaPlayers = players.filter(p => 
      p.teamName?.includes("Hanwha") || p.team?.includes("hanwha") || p.team === "oe:team:3a1d18f46bcb3716ebcfcf4ef068934"
    );
    console.log(`Found ${hanwhaPlayers.length} Hanwha Life Esports players:`, hanwhaPlayers);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {players.map((player, index) => {
        // Vérification supplémentaire que le joueur a un ID
        if (!player.id) {
          console.warn("Player missing ID, skipping:", player);
          return null;
        }
        
        return (
          <motion.div
            key={player.id || `player-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="h-full"
          >
            <Link to={`/players/${player.id}`} className="h-full block">
              <PlayerCard player={player} showTeamLogo={true} />
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
};

export default PlayersList;
