
import React from "react";
import { Player } from "@/utils/models/types";
import PlayerImage from "@/components/player/PlayerImage";
import TeamInfo from "@/components/player/TeamInfo";
import PlayerStats from "@/components/player/PlayerStats";

interface PlayerCardProps {
  player: Player & { teamName?: string; teamRegion?: string };
  showTeamLogo?: boolean;
}

const PlayerCard = ({ player, showTeamLogo = false }: PlayerCardProps) => {
  // Fonction pour obtenir le nom d'affichage du rôle
  const getRoleDisplayName = (role: string): string => {
    switch (role.toLowerCase()) {
      case "top": return "top";
      case "jungle": 
      case "jng":
      case "jg": return "jng";
      case "mid": return "mid";
      case "adc": 
      case "bot": return "bot";
      case "support": 
      case "sup": return "sup";
      default: return role.toLowerCase();
    }
  };

  return (
    <div className="group h-full bg-white rounded-lg shadow-subtle hover:shadow-md transition-all border border-gray-100 overflow-hidden">
      <div className="relative">
        <PlayerImage name={player.name} image={player.image} role={player.role} />
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-slate-600 flex items-center justify-center">
          <div className="flex items-center text-white font-medium">
            <span>{getRoleDisplayName(player.role)}</span>
          </div>
        </div>
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
