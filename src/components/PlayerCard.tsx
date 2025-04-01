
import React from "react";
import { Player } from "@/utils/models/types";
import PlayerImage from "@/components/player/PlayerImage";
import RoleBadge from "@/components/player/RoleBadge";
import TeamInfo from "@/components/player/TeamInfo";
import PlayerStats from "@/components/player/PlayerStats";
import { getRoleIconPath } from "@/components/player/RoleBadge";

interface PlayerCardProps {
  player: Player & { teamName?: string; teamRegion?: string };
  showTeamLogo?: boolean;
}

const PlayerCard = ({ player, showTeamLogo = false }: PlayerCardProps) => {
  const roleIconPath = getRoleIconPath(player.role);
  
  return (
    <div className="group h-full bg-white rounded-lg shadow-subtle hover:shadow-md transition-all border border-gray-100 overflow-hidden">
      <div className="relative">
        <PlayerImage name={player.name} image={player.image} role={player.role} />
        <RoleBadge role={player.role} />
        
        {roleIconPath && (
          <div className="absolute top-2 right-2 w-7 h-7 rounded-md bg-black/30 flex items-center justify-center p-1">
            <img 
              src={roleIconPath} 
              alt={`${player.role} role`}
              className="w-full h-full object-contain" 
            />
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex flex-col">
          <h3 className="font-bold text-lg mb-1 text-gray-900">{player.name}</h3>
          <TeamInfo 
            teamId={player.team} 
            teamName={player.teamName} 
            showTeamLogo={showTeamLogo} 
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
