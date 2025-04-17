
import React from "react";
import { Player, PlayerRole } from "@/utils/models/types";
import PlayerImage from "@/components/player/PlayerImage";
import TeamInfo from "@/components/player/TeamInfo";
import PlayerStats from "@/components/player/PlayerStats";
import { normalizeImageUrl, hasPlayerImage } from "@/utils/database/teams/images/imageUtils";

interface PlayerCardProps {
  player: Player & { teamName?: string; teamRegion?: string };
  showTeamLogo?: boolean;
}

const PlayerCard = ({ player, showTeamLogo = false }: PlayerCardProps) => {
  // Vérification défensive pour les données du joueur
  if (!player) {
    console.error("PlayerCard a reçu un joueur indéfini");
    return null;
  }
  
  // Ensure we have a valid player ID
  const playerId = player.id ? player.id.trim() : null;
  
  // Log debugging information about this player's image
  console.log(`PlayerCard: Player ${player.name} (ID: ${playerId}):`, {
    originalImage: player.image,
    hasImage: hasPlayerImage(player)
  });
  
  return (
    <div className="group h-full bg-white rounded-lg shadow-subtle hover:shadow-md transition-all border border-gray-100 overflow-hidden">
      <div className="relative">
        <PlayerImage 
          name={player.name} 
          playerId={playerId}
          image={player.image} 
          role={player.role} 
        />
      </div>
      
      <div className="p-4">
        <div className="flex flex-col">
          <h3 className="font-bold text-lg mb-1 text-gray-900">{player.name}</h3>
          <TeamInfo 
            teamId={player.team} 
            teamName={player.teamName} 
            showTeamLogo={showTeamLogo} 
            region={player.teamRegion}
          />
        </div>
        
        <PlayerStats 
          kda={player.kda} 
          csPerMin={player.csPerMin} 
          damageShare={player.damageShare} 
        />
      </div>
    </div>
  );
};

export default PlayerCard;
