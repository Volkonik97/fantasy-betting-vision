
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Player, PlayerRole } from "@/utils/models/types";
import PlayerCard from "@/components/PlayerCard";

interface PlayersListProps {
  players: (Player & { teamName: string; teamRegion: string })[];
  loading: boolean;
}

const PlayersList = ({ players, loading }: PlayersListProps) => {
  // Log players info on initial render and when players change 
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
    
    // Vérifier si des joueurs ont des données manquantes
    const playersWithMissingData = players.filter(p => 
      !p.id || !p.name || !p.role || !p.teamName || !p.teamRegion
    );
    
    if (playersWithMissingData.length > 0) {
      console.warn(`⚠️ ${playersWithMissingData.length} joueurs avec des données manquantes`);
      playersWithMissingData.slice(0, 3).forEach(p => 
        console.warn(`  - Joueur incomplet: ${p.name || 'Sans nom'}, ID: ${p.id || 'Sans ID'}, Équipe: ${p.teamName || 'Inconnue'}`)
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
          console.warn("Rendering fallback card for player with missing data:", player);
          return (
            <div key={index} className="p-4 bg-red-100 text-sm">
              ⚠️ Player sans ID ou nom<br />
              <pre>{JSON.stringify(player, null, 2)}</pre>
            </div>
          );
        }
        
        // Ensure player has teamName and teamRegion (defensive coding)
        // We cast role to PlayerRole to ensure type compatibility
        const enrichedPlayer = {
          ...player,
          teamName: player.teamName || "Équipe inconnue",
          teamRegion: player.teamRegion || "Région inconnue",
          role: (player.role || "Unknown") as PlayerRole
        };
        
        return (
          <div
            key={player.id || index}
            className="h-full"
          >
            <Link to={`/players/${player.id}`} className="h-full block">
              <PlayerCard player={enrichedPlayer} showTeamLogo={true} />
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default PlayersList;
