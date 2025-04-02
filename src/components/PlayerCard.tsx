
import React from "react";
import { Player, PlayerRole } from "@/utils/models/types";
import PlayerImage from "@/components/player/PlayerImage";
import TeamInfo from "@/components/player/TeamInfo";
import PlayerStats from "@/components/player/PlayerStats";

interface PlayerCardProps {
  player: Player & { teamName?: string; teamRegion?: string };
  showTeamLogo?: boolean;
}

const PlayerCard = ({ player, showTeamLogo = false }: PlayerCardProps) => {
  // Ensure player has all necessary properties with better defensive coding
  if (!player) {
    console.error("PlayerCard received undefined player");
    return null;
  }
  
  // Add debugging information
  console.log(`Rendering PlayerCard for: ${player.name}, Role: ${player.role}, Team: ${player.team}, Region: ${player.teamRegion || 'unknown'}`);
  
  const normalizedPlayer = {
    ...player,
    role: player.role || 'Mid', // Fallback to Mid if role is missing
    teamName: player.teamName || "",
    teamRegion: player.teamRegion || "",
    kda: player.kda || 0,
    csPerMin: player.csPerMin || 0,
    damageShare: player.damageShare || 0,
  };
  
  return (
    <div className="group h-full bg-white rounded-lg shadow-subtle hover:shadow-md transition-all border border-gray-100 overflow-hidden">
      <div className="relative">
        <PlayerImage 
          name={normalizedPlayer.name} 
          image={normalizedPlayer.image} 
          role={normalizedPlayer.role} 
        />
      </div>
      
      <div className="p-4">
        <div className="flex flex-col">
          <h3 className="font-bold text-lg mb-1 text-gray-900">{normalizedPlayer.name}</h3>
          <TeamInfo 
            teamId={normalizedPlayer.team} 
            teamName={normalizedPlayer.teamName} 
            showTeamLogo={showTeamLogo} 
            region={normalizedPlayer.teamRegion}
          />
        </div>
        
        <PlayerStats 
          kda={normalizedPlayer.kda} 
          csPerMin={normalizedPlayer.csPerMin} 
          damageShare={normalizedPlayer.damageShare} 
        />
      </div>
    </div>
  );
};

export default PlayerCard;
