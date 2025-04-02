
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Player } from "@/utils/models/types";
import PlayerCard from "@/components/PlayerCard";
import { normalizeRoleName } from "@/utils/leagueData/assembler/modelConverter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface TeamPlayersListProps {
  players: Player[];
  teamName?: string;
}

const TeamPlayersList = ({ players, teamName }: TeamPlayersListProps) => {
  const [sortedPlayers, setSortedPlayers] = useState<Player[]>([]);
  
  useEffect(() => {
    console.log(`TeamPlayersList: Received ${players?.length || 0} players for team ${teamName}`);
    
    if (!players || players.length === 0) {
      console.warn(`No players provided to TeamPlayersList for team: ${teamName}`);
      return;
    }
    
    // Log all players for debugging
    players.forEach(player => {
      console.log(`Player in list: ${player.name}, Role: ${player.role}, Team: ${player.team}`);
    });
    
    // Create a deep copy of the players array to avoid mutation issues
    const playersCopy = JSON.parse(JSON.stringify(players));
    
    // Ensure all players have normalized roles before sorting
    const playersWithNormalizedRoles = playersCopy.map((player: Player) => ({
      ...player,
      role: normalizeRoleName(player.role || "Mid")
    }));
    
    // Sort players by role in the standard order: Top, Jungle/Jng, Mid, ADC/Bot, Support/Sup
    const sorted = [...playersWithNormalizedRoles].sort((a, b) => {
      const roleOrder: Record<string, number> = {
        'Top': 0,
        'Jungle': 1, 
        'Mid': 2,
        'ADC': 3,
        'Support': 4
      };
      
      // Get the standardized role for sorting purposes
      const getRoleSortValue = (role: string): number => {
        const normalizedRole = normalizeRoleName(role || "Mid");
        return roleOrder[normalizedRole] !== undefined ? roleOrder[normalizedRole] : 999; // Default to end if unknown
      };
      
      return getRoleSortValue(a.role) - getRoleSortValue(b.role);
    });
    
    console.log(`Sorted players (${sorted.length}): ${sorted.map(p => `${p.name} (${p.role})`).join(', ')}`);
    setSortedPlayers(sorted);
  }, [players, teamName]);

  // Defensive check to avoid errors with undefined players
  if (!players || players.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="mt-8"
      >
        <h2 className="text-2xl font-bold mb-4">Joueurs (0)</h2>
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Aucun joueur trouvé</AlertTitle>
          <AlertDescription>
            Aucun joueur n'a été trouvé pour cette équipe. Cela pourrait être dû à un problème lors de l'importation des données ou à une erreur dans la base de données.
          </AlertDescription>
        </Alert>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <p className="col-span-full text-gray-500 text-center py-8">
            Aucun joueur trouvé pour cette équipe
          </p>
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
        {sortedPlayers.length > 0 ? (
          sortedPlayers.map(player => {
            console.log(`Rendering player: ${player.name}, Role: ${player.role}`);
            
            // Enrichir le joueur avec le nom de l'équipe si disponible
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
                <PlayerCard player={enrichedPlayer} showTeamLogo={true} />
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
