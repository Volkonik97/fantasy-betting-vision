
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Player, PlayerRole } from "@/utils/models/types";
import PlayerCard from "@/components/PlayerCard";
import { hasPlayerImage } from "@/utils/database/teams/images/imageUtils";

interface PlayersListProps {
  players: (Player & { teamName: string; teamRegion: string })[];
  loading: boolean;
}

const PlayersList = ({ players, loading }: PlayersListProps) => {
  // Log for debugging image URLs in player data
  useEffect(() => {
    console.log(`PlayersList: Received ${players.length} players`);
    
    // Log sample of players to check image URLs
    if (players.length > 0) {
      console.log("Sample players with image URLs:", 
        players.slice(0, 3).map(p => ({
          name: p.name,
          id: p.id,
          imageUrl: p.image,
          hasImage: hasPlayerImage(p.image),
          role: p.role
        }))
      );
      
      // Count players with images vs without
      const withImages = players.filter(p => hasPlayerImage(p.image)).length;
      console.log(`Players with images: ${withImages}/${players.length}`);
    }
  }, [players]);
  
  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
        <p className="text-gray-500">Chargement des joueurs...</p>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="col-span-full py-10 text-center">
        <p className="text-gray-500">Aucun joueur trouvé correspondant à vos filtres.</p>
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
