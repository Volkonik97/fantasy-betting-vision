
import React from "react";
import { Player, PlayerRole } from "@/utils/models/types";
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
    console.error("PlayerCard a reçu un joueur indéfini");
    return null;
  }
  
  const playerId = player.id ? player.id.trim() : null;
  
  // Log player data for debugging
  console.log(`PlayerCard: Player ${player.name} (ID: ${playerId}):`, {
    damageShare: player.damageShare,
    type: typeof player.damageShare
  });
  
  // Vérification explicite et conversion des valeurs de stats pour s'assurer qu'elles sont correctes
  // Cette approche est similaire à celle utilisée dans PlayerHeader.tsx
  const getDamageShareValue = () => {
    // Récupérer la valeur initiale
    let damageShareValue = player.damageShare;
    
    console.log(`PlayerCard processing damageShareValue for ${player.name}:`, damageShareValue, typeof damageShareValue);
    
    // Convertir en chaîne pour traitement sécurisé
    const valueAsString = String(damageShareValue || '0');
    
    // Supprimer tout signe de pourcentage et convertir en nombre
    const cleanedValue = valueAsString.replace(/%/g, '');
    const numericValue = parseFloat(cleanedValue);
    
    console.log(`PlayerCard cleaned value for ${player.name}:`, cleanedValue, numericValue);
    
    // Si c'est un décimal entre 0-1, convertir en pourcentage
    if (!isNaN(numericValue)) {
      const finalValue = (numericValue >= 0 && numericValue <= 1) 
        ? numericValue * 100 
        : numericValue;
      
      return finalValue;
    }
    
    return 0;
  };
  
  // Calculer la valeur de damageShare une seule fois
  const processedDamageShare = getDamageShareValue();
  
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
          damageShare={processedDamageShare}
        />
      </div>
    </div>
  );
};

export default PlayerCard;
