
import React, { useEffect } from "react";
import { Player, PlayerRole } from "@/utils/models/types";
import PlayerImage from "@/components/player/PlayerImage";
import TeamInfo from "@/components/player/TeamInfo";
import PlayerStats from "@/components/player/PlayerStats";

interface PlayerCardProps {
  player: Player & { teamName?: string; teamRegion?: string };
  showTeamLogo?: boolean;
}

const PlayerCard = ({ player, showTeamLogo = false }: PlayerCardProps) => {
  // Defensive check for player data
  if (!player) {
    console.error("PlayerCard received undefined player");
    return null;
  }
  
  // Ensure required properties exist with meaningful defaults
  const normalizedPlayer = {
    ...player,
    role: player.role || 'Mid', // Fallback role if missing
    teamName: player.teamName || "", 
    teamRegion: player.teamRegion || "",
    kda: player.kda || 0,
    csPerMin: player.csPerMin || 0,
    damageShare: player.damageShare || 0,
  };
  
  // Add debug information for this specific player
  useEffect(() => {
    console.log(`PlayerCard mounted for: ${player.name}, Role: ${player.role}, Team: ${player.team}, TeamName: ${player.teamName || 'not set'}, Region: ${player.teamRegion || 'unknown'}, ID: ${player.id}`);
    console.log(`Player stats - KDA: ${player.kda}, CS/min: ${player.csPerMin}, Damage Share: ${player.damageShare}`);
    console.log(`Player image URL: ${player.image || 'no image'}`);
    
    // Verify if the player has all required properties
    if (!player.role || !player.teamName || !player.teamRegion) {
      console.warn(`⚠️ PlayerCard: Player ${player.name} missing properties: ` +
        `${!player.role ? 'role ' : ''}` +
        `${!player.teamName ? 'teamName ' : ''}` +
        `${!player.teamRegion ? 'teamRegion ' : ''}`
      );
    }
    
    return () => {
      console.log(`PlayerCard unmounted for: ${player.name}`);
    };
  }, [player]);
  
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
