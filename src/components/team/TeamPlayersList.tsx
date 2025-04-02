
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
    
    // Create a deep copy of the players array to avoid mutation issues
    const playersCopy = JSON.parse(JSON.stringify(players));
    
    // Ensure all players have normalized roles before sorting
    const playersWithNormalizedRoles = playersCopy.map((player: Player) => {
      const normalizedRole = normalizeRoleName(player.role);
      console.log(`Player in team list: ${player.name}, Original Role: ${player.role}, Normalized Role: ${normalizedRole}, Team: ${player.team}`);
      return {
        ...player,
        role: normalizedRole
      };
    });
    
    // Sort players by role in the standard order: Top, Jungle, Mid, ADC, Support
    const sorted = [...playersWithNormalizedRoles].sort((a, b) => {
      const roleOrder: Record<string, number> = {
        'Top': 0,
        'Jungle': 1, 
        'Mid': 2,
        'ADC': 3,
        'Support': 4
      };
      
      const roleA = normalizeRoleName(a.role);
      const roleB = normalizeRoleName(b.role);
      
      return roleOrder[roleA] - roleOrder[roleB];
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
            // Always ensure role is properly normalized
            const enrichedPlayer = {
              ...player,
              teamName: teamName || player.teamName || player.team
            };
            
            return (
              <motion.div 
                key={player.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <Link 
                  to={`/players/${player.id}`} 
                  className="h-full block"
                >
                  <PlayerCard player={enrichedPlayer} showTeamLogo={true} />
                </Link>
              </motion.div>
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
