
import React, { useEffect } from "react";
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
  // Check if players is defined and is an array
  const hasPlayers = Array.isArray(players) && players.length > 0;
  
  console.log(`TeamPlayersList rendered with ${players?.length || 0} players for team ${teamName || 'unknown'}`);
  if (Array.isArray(players)) {
    console.log("Players data:", JSON.stringify(players, null, 2));
  } else {
    console.log("Players data is not an array:", players);
  }
  
  useEffect(() => {
    if (!hasPlayers && teamName) {
      console.warn(`No players found for team ${teamName}`);
    }
  }, [hasPlayers, teamName]);
  
  // Sort players by role in the standard order: Top, Jungle, Mid, ADC/Bot, Support
  const sortedPlayers = hasPlayers 
    ? [...players].sort((a, b) => {
        const roleOrder: Record<string, number> = {
          'Top': 0,
          'Jungle': 1, 
          'Mid': 2,
          'ADC': 3,
          'Support': 4
        };
        
        // Get the standardized role for sorting purposes
        const getRoleSortValue = (role: string): number => {
          const normalizedRole = normalizeRoleName(role);
          return roleOrder[normalizedRole] ?? 2; // Default to Mid (2) if unknown
        };
        
        return getRoleSortValue(a.role) - getRoleSortValue(b.role);
      })
    : [];

  if (!hasPlayers) {
    console.warn(`No players found for team ${teamName}`);
    setTimeout(() => {
      toast.error(`Impossible de charger les joueurs pour l'équipe ${teamName || 'sélectionnée'}`);
    }, 1000);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="mt-8"
      >
        <h2 className="text-2xl font-bold mb-4">Joueurs (0)</h2>
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500">Aucun joueur trouvé pour cette équipe</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="mt-8"
    >
      <h2 className="text-2xl font-bold mb-4">Joueurs ({sortedPlayers.length})</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {sortedPlayers.map(player => {
          // Verify player has all required properties before rendering
          if (!player || !player.id) {
            console.error("Invalid player data:", player);
            return null;
          }
          
          // Enrich player with team name if available
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
