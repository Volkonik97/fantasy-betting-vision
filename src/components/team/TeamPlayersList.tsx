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
  teamRegion?: string;
}

const TeamPlayersList = ({ players, teamName, teamRegion }: TeamPlayersListProps) => {
  const [sortedPlayers, setSortedPlayers] = useState<Player[]>([]);
  
  useEffect(() => {
    // Log detailed information about the players received
    console.log(`TeamPlayersList: ${teamName} (${teamRegion || 'unknown region'}) - Received ${players?.length || 0} players`);
    
    if (!players || players.length === 0) {
      console.warn(`No players provided for team: ${teamName}`);
      setSortedPlayers([]);
      return;
    }
    
    // Make sure we have a clean, deep copy to avoid mutation issues
    const playersCopy = JSON.parse(JSON.stringify(players));

    playersCopy.forEach((p: Player) => {
  if (p.name?.toLowerCase().includes("kiin")) {
    console.warn("👀 Joueur trouvé dans TeamPlayersList :", p);
  }
});
    
    // Enrich and normalize each player
    const enrichedPlayers = playersCopy.map((player: Player) => {
      const normalizedRole = normalizeRoleName(player.role);
      
      // Log each player being processed
      console.log(`Processing player: ${player.name}, Role: ${normalizedRole}, Original Team: ${player.team}, Team Name: ${player.teamName || teamName}`);
      
      // Make sure the player has all required data, especially team information
      return {
        ...player,
        role: normalizedRole,
        teamName: player.teamName || teamName || "",
        teamRegion: player.teamRegion || teamRegion || ""
      };
    });
    
    // Sort by standard role order
    const sorted = [...enrichedPlayers].sort((a, b) => {
      const roleOrder: Record<string, number> = {
        'Top': 0,
        'Jungle': 1, 
        'Mid': 2,
        'ADC': 3,
        'Support': 4
      };
      
      const roleA = normalizeRoleName(a.role);
      const roleB = normalizeRoleName(b.role);
      
      return (roleOrder[roleA] ?? 99) - (roleOrder[roleB] ?? 99);
    });
    
    // Log all sorted players for debugging
    console.log(`Team ${teamName}: Sorted players (${sorted.length}):`);
    sorted.forEach(player => {
      console.log(`- ${player.name} (${player.role}) with team ${player.teamName}, region ${player.teamRegion}`);
    });
    
    setSortedPlayers(sorted);
  }, [players, teamName, teamRegion]); // Dépendance explicite à players, teamName et teamRegion

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
      key={`players-list-${sortedPlayers.length}`} // Force re-render on player list changes
    >
      <h2 className="text-2xl font-bold mb-4">Joueurs ({sortedPlayers.length})</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {sortedPlayers.length > 0 ? (
          sortedPlayers.map((player, index) => {
            // Final enrichment of player data before rendering
            const enrichedPlayer = {
              ...player,
              teamName: player.teamName || teamName || "",
              teamRegion: player.teamRegion || teamRegion || ""
            };
            
            return (
              <motion.div 
                key={`${player.id || index}-${player.name}`} // Use more reliable key with fallback
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
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
