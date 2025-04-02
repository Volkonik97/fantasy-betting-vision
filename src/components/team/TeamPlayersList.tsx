
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Player } from "@/utils/models/types";
import PlayerCard from "@/components/PlayerCard";
import { normalizeRoleName } from "@/utils/leagueData/assembler/modelConverter";
import { toast } from "sonner";

interface TeamPlayersListProps {
  players: Player[];
  teamName?: string;
}

const TeamPlayersList = ({ players, teamName }: TeamPlayersListProps) => {
  const [sortedPlayers, setSortedPlayers] = useState<Player[]>([]);
  
  useEffect(() => {
    if (Array.isArray(players) && players.length > 0) {
      console.log(`TeamPlayersList: Received ${players.length} players`);
      
      // Define role order for sorting
      const roleOrder: Record<string, number> = {
        'Top': 0,
        'Jungle': 1,
        'Mid': 2,
        'ADC': 3,
        'Support': 4
      };
      
      // Sort function using normalized role names
      const sortedList = [...players].sort((a, b) => {
        const roleA = normalizeRoleName(a.role);
        const roleB = normalizeRoleName(b.role);
        return (roleOrder[roleA] ?? 99) - (roleOrder[roleB] ?? 99);
      });
      
      setSortedPlayers(sortedList);
    } else {
      console.log("TeamPlayersList: No players data received or empty array");
      setSortedPlayers([]);
    }
  }, [players]);

  // If no players data available
  if (!Array.isArray(players) || players.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-8 bg-white rounded-xl shadow-subtle p-6 border border-gray-100"
      >
        <h2 className="text-2xl font-bold mb-4">Joueurs (0)</h2>
        <p className="text-gray-500 text-center py-8">
          Aucun joueur trouvé pour cette équipe
        </p>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-8 bg-white rounded-xl shadow-subtle p-6 border border-gray-100"
    >
      <h2 className="text-2xl font-bold mb-4">Joueurs ({sortedPlayers.length})</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {sortedPlayers.map((player) => {
          // Ensure the player has all required data
          if (!player.id) {
            console.warn("Player missing ID:", player);
            return null;
          }
          
          // Enrich player with team name
          const enrichedPlayer = {
            ...player,
            teamName: teamName || player.teamName || player.team
          };
          
          return (
            <Link 
              to={`/players/${player.id}`} 
              key={player.id}
              className="h-full block"
            >
              <PlayerCard player={enrichedPlayer} showTeamLogo={false} />
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
};

export default TeamPlayersList;
