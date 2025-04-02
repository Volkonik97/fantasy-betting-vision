
import React from "react";
import { Player } from "@/utils/models/types";
import PlayerImage from "@/components/player/PlayerImage";
import RoleBadge from "@/components/player/RoleBadge";
import TeamInfo from "@/components/player/TeamInfo";
import PlayerStats from "@/components/player/PlayerStats";
import { normalizeRoleName } from "@/utils/leagueData/assembler/modelConverter";

interface PlayerCardProps {
  player: Player & { teamName?: string; teamRegion?: string; };
  showTeamLogo?: boolean;
}

const PlayerCard = ({ player, showTeamLogo = false }: PlayerCardProps) => {
  // Validation des données et des valeurs par défaut
  if (!player) {
    console.error("PlayerCard received undefined player");
    return null;
  }

  // Ensure role is normalized and always has a valid value
  const normalizedRole = normalizeRoleName(player.role || 'Unknown');
  
  // Ensure numeric values are valid numbers
  const kda = typeof player.kda === 'number' && !isNaN(player.kda) ? player.kda : 0;
  const csPerMin = typeof player.csPerMin === 'number' && !isNaN(player.csPerMin) ? player.csPerMin : 0;
  const damageShare = typeof player.damageShare === 'number' && !isNaN(player.damageShare) ? player.damageShare : 0;

  // Use player.team as teamId, ensuring it exists
  const teamId = player.team || '';

  // Log for debugging
  if (!teamId) {
    console.warn("Player has no team ID:", player.name);
  }

  return (
    <div className="group h-full bg-white rounded-lg shadow-subtle hover:shadow-md transition-all border border-gray-100 overflow-hidden">
      <div className="relative">
        <PlayerImage 
          name={player.name} 
          image={player.image} 
          role={normalizedRole} 
        />
        <RoleBadge role={normalizedRole} />
      </div>
      
      <div className="p-4">
        <div className="flex flex-col">
          <h3 className="font-bold text-lg mb-1 text-gray-900">{player.name}</h3>
          <TeamInfo 
            teamId={teamId} 
            teamName={player.teamName} 
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
