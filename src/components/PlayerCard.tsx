
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
  // Ensure role is normalized and always has a valid value
  const normalizedRole = normalizeRoleName(player.role || 'Unknown');
  
  // Ensure numeric values are valid numbers
  const kda = typeof player.kda === 'number' && !isNaN(player.kda) ? player.kda : 0;
  const csPerMin = typeof player.csPerMin === 'number' && !isNaN(player.csPerMin) ? player.csPerMin : 0;
  const damageShare = typeof player.damageShare === 'number' && !isNaN(player.damageShare) ? player.damageShare : 0;

  // Use team as teamId, don't reference team_id directly since it's not in the Player type
  const teamId = player.team || '';

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
