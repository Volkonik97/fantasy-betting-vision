
import React from "react";
import { Player } from "@/utils/models/types";
import PlayerImage from "@/components/player/PlayerImage";
import RoleBadge from "@/components/player/RoleBadge";
import TeamInfo from "@/components/player/TeamInfo";
import PlayerStats from "@/components/player/PlayerStats";

interface PlayerCardProps {
  player: Player & { teamName?: string; teamRegion?: string };
  showTeamLogo?: boolean;
}

const PlayerCard = ({ player, showTeamLogo = false }: PlayerCardProps) => {
  // Ensure player data exists and has required properties
  if (!player) {
    console.error("PlayerCard received null or undefined player");
    return null;
  }

  // Add defensive checks for required properties
  const name = player.name || "Unknown Player";
  const role = player.role || "Mid";
  const image = player.image || "";
  const teamId = player.team || "";
  const teamName = player.teamName || "";
  
  // Make sure all numeric values have defaults
  const kda = typeof player.kda === 'number' ? player.kda : 0;
  const csPerMin = typeof player.csPerMin === 'number' ? player.csPerMin : 0;
  const damageShare = typeof player.damageShare === 'number' ? player.damageShare : 0;
  
  // Log player data for debugging
  console.log(`PlayerCard rendering player: ${name}, role: ${role}, team: ${teamName || teamId}`);
  
  return (
    <div className="group h-full bg-white rounded-lg shadow-subtle hover:shadow-md transition-all border border-gray-100 overflow-hidden">
      <div className="relative">
        <PlayerImage name={name} image={image} role={role} />
        <RoleBadge role={role} />
      </div>
      
      <div className="p-4">
        <div className="flex flex-col">
          <h3 className="font-bold text-lg mb-1 text-gray-900">{name}</h3>
          <TeamInfo 
            teamId={teamId} 
            teamName={teamName} 
            showTeamLogo={showTeamLogo} 
          />
        </div>
        
        <PlayerStats 
          kda={kda} 
          csPerMin={csPerMin} 
          damageShare={damageShare} 
        />
      </div>
    </div>
  );
};

export default PlayerCard;
