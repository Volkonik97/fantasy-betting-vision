
import React, { useEffect } from "react";
import { Player } from "@/utils/models/types";
import PlayerImage from "@/components/player/PlayerImage";
import TeamInfo from "@/components/player/TeamInfo";
import PlayerStats from "@/components/player/PlayerStats";
import { normalizeRoleName } from "@/utils/leagueData/assembler/modelConverter";

interface PlayerCardProps {
  player: Player & { teamName?: string; teamRegion?: string };
  showTeamLogo?: boolean;
}

const PlayerCard = ({ player, showTeamLogo = false }: PlayerCardProps) => {
  // Always normalize role when rendering
  const normalizedRole = normalizeRoleName(player.role || 'Mid');
  
  // Log if the role needed normalization
  useEffect(() => {
    if (normalizedRole !== player.role) {
      console.log(`PlayerCard: Normalized role for ${player.name} from ${player.role} to ${normalizedRole}`);
    }
  }, [player, normalizedRole]);
  
  // Create a normalized player object
  const normalizedPlayer = {
    ...player,
    role: normalizedRole
  };
  
  return (
    <div className="group h-full bg-white rounded-lg shadow-subtle hover:shadow-md transition-all border border-gray-100 overflow-hidden">
      <div className="relative">
        <PlayerImage name={normalizedPlayer.name} image={normalizedPlayer.image} role={normalizedPlayer.role} />
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
