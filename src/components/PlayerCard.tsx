
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
  // Defensive check for player data
  if (!player) {
    console.error("PlayerCard received undefined player");
    return null;
  }
  
  // Log player data including damage share for debugging
  console.log(`Rendering PlayerCard for ${player.name}`, {
    id: player.id,
    role: player.role,
    imageUrl: player.image,
    damageShare: player.damageShare,
    damageShareType: typeof player.damageShare,
    damageShareParsed: typeof player.damageShare === 'string' ? parseFloat(player.damageShare) : player.damageShare
  });
  
  // Handle damageShare to ensure it's a valid number or string
  let normalizedDamageShare = player.damageShare;
  if (normalizedDamageShare === null || normalizedDamageShare === undefined) {
    normalizedDamageShare = 0;
  } else if (typeof normalizedDamageShare === 'string') {
    const parsed = parseFloat(normalizedDamageShare);
    if (!isNaN(parsed)) {
      normalizedDamageShare = parsed;
    } else {
      normalizedDamageShare = 0;
    }
  } else if (typeof normalizedDamageShare === 'number' && isNaN(normalizedDamageShare)) {
    normalizedDamageShare = 0;
  }
  
  // If the image URL is from Supabase storage but doesn't include the full path, fix it
  let imageUrl = player.image;
  if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
    // If it's just a filename, assume it's in the player-images bucket
    if (!imageUrl.includes('/')) {
      imageUrl = `https://dtddoxxazhmfudrvpszu.supabase.co/storage/v1/object/public/player-images/${imageUrl}`;
      console.log(`Fixed image URL for ${player.name}: ${imageUrl}`);
    }
  }
  
  // Ensure required properties exist with meaningful defaults
  const normalizedPlayer = {
    ...player,
    image: imageUrl,
    role: player.role || 'Mid', // Fallback role if missing
    teamName: player.teamName || "", 
    teamRegion: player.teamRegion || "",
    kda: player.kda || 0,
    csPerMin: player.csPerMin || 0,
    damageShare: normalizedDamageShare,
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
