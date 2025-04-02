
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Player } from "@/utils/models/types";
import PlayerCard from "@/components/PlayerCard";
import PlayerSkeletonCard from "@/components/players/PlayerSkeletonCard";
import { useInView } from "react-intersection-observer";

interface PlayersListProps {
  players: (Player & { teamName: string; teamRegion: string })[];
  loading: boolean;
}

const PlayersList = ({ players, loading }: PlayersListProps) => {
  // Generate skeleton placeholders while loading
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 15 }).map((_, index) => (
          <motion.div
            key={`skeleton-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <PlayerSkeletonCard />
          </motion.div>
        ))}
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

  // Additional verification that all players have the required data
  const validPlayers = players.filter(player => player && player.id && player.name);
  if (validPlayers.length !== players.length) {
    console.warn(`Filtered out ${players.length - validPlayers.length} invalid players`);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {validPlayers.map((player, index) => (
        <LazyPlayerCard 
          key={player.id || `player-${index}`} 
          player={player} 
          index={index} 
        />
      ))}
    </div>
  );
};

// Component that lazily renders a player card when it comes into view
const LazyPlayerCard = ({ player, index }: { 
  player: Player & { teamName: string; teamRegion: string }, 
  index: number 
}) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px 0px', // Start loading when player is 200px from viewport
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.9) }}
      className="h-full"
    >
      {inView ? (
        <Link to={`/players/${player.id}`} className="h-full block">
          <PlayerCard player={player} showTeamLogo={true} />
        </Link>
      ) : (
        <div className="h-full">
          <PlayerSkeletonCard />
        </div>
      )}
    </motion.div>
  );
};

export default PlayersList;
