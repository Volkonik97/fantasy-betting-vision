
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Player } from "@/utils/models/types";
import PlayerCard from "@/components/PlayerCard";

interface TeamPlayersListProps {
  players: Player[];
  teamName?: string;
}

const TeamPlayersList = ({ players, teamName }: TeamPlayersListProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="mt-8"
    >
      <h2 className="text-2xl font-bold mb-4">Joueurs ({players.length})</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {players.length > 0 ? (
          players.map(player => {
            // Enrichir le joueur avec le nom de l'équipe si disponible
            const enrichedPlayer = {
              ...player,
              teamName: teamName || player.teamName || player.team
            };
            
            return (
              <Link 
                to={`/players/${player.id}`} 
                key={player.id}
                className="transition-transform hover:scale-105"
              >
                <PlayerCard player={enrichedPlayer} />
              </Link>
            );
          })
        ) : (
          <p className="col-span-full text-gray-500 text-center py-8">
            Aucun joueur trouvé pour cette équipe
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default TeamPlayersList;
