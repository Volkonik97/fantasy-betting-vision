
import React from "react";
import { Player } from "@/utils/models/types";
import PlayerImage from "@/components/player/PlayerImage";
import TeamInfo from "@/components/player/TeamInfo";
import PlayerStats from "@/components/player/PlayerStats";
import { normalizeImageUrl, hasPlayerImage } from "@/utils/database/teams/images/imageUtils";

interface PlayerCardProps {
  player: Player & { teamName?: string; teamRegion?: string };
  showTeamLogo?: boolean;
}

const PlayerCard = ({ player, showTeamLogo = false }: PlayerCardProps) => {
  if (!player) {
    console.error("PlayerCard received undefined player");
    return null;
  }
  
  const playerId = player.id ? player.id.trim() : null;
  
  // More detailed debugging for kill participation
  console.log(`PlayerCard: Player ${player.name} KP data:`, {
    killParticipation: player.killParticipation,
    killParticipationType: typeof player.killParticipation,
    kill_participation_pct: player.kill_participation_pct,
    kill_participation_pct_type: typeof player.kill_participation_pct
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
          killParticipation={player.killParticipation}
        />
      </div>
    </div>
  );
};

export default PlayerCard;
