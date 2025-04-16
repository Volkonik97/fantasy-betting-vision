
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
  // Vérification défensive pour les données du joueur
  if (!player) {
    console.error("PlayerCard a reçu un joueur indéfini");
    return null;
  }
  
  // Make sure we have a valid image property before logging
  const imageStr = player.image ? player.image.toString() : 'aucune';
  console.log(`Rendu de la carte pour ${player.name} avec image: ${imageStr}`);
  
  // Normaliser l'URL de l'image si elle existe
  // Cette fonction garantit la cohérence entre les rechargements de page
  const normalizeImageUrl = (imageUrl: string | null | undefined): string | null | undefined => {
    if (!imageUrl) return imageUrl;
    
    // Trim any leading/trailing whitespace
    const cleanUrl = imageUrl.trim();
    
    // Si c'est déjà un nom de fichier simple, le retourner tel quel
    if (!cleanUrl.includes('/') && !cleanUrl.startsWith('http')) {
      return cleanUrl;
    }
    
    // Essayer d'extraire le nom du fichier depuis l'URL de stockage Supabase
    if (cleanUrl.includes('supabase.co/storage') && cleanUrl.includes('player-images')) {
      const regex = /player-images\/([^?]+)/;
      const match = cleanUrl.match(regex);
      
      if (match && match[1]) {
        try {
          // Retourner le nom du fichier décodé sans l'URL complète
          return decodeURIComponent(match[1]);
        } catch (e) {
          console.error("Erreur lors du décodage de l'URL:", e);
          return cleanUrl;
        }
      }
    }
    
    return cleanUrl;
  };
  
  // Créer une copie du joueur avec l'URL d'image normalisée
  const playerWithNormalizedImage = {
    ...player,
    image: normalizeImageUrl(player.image)
  };
  
  // Log the normalized image for debugging
  if (playerWithNormalizedImage.image !== player.image) {
    console.log(`Image normalisée pour ${player.name}: ${playerWithNormalizedImage.image} (original: ${player.image})`);
  }
  
  return (
    <div className="group h-full bg-white rounded-lg shadow-subtle hover:shadow-md transition-all border border-gray-100 overflow-hidden">
      <div className="relative">
        <PlayerImage 
          name={player.name} 
          image={playerWithNormalizedImage.image} 
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
          damageShare={player.damageShare} 
        />
      </div>
    </div>
  );
};

export default PlayerCard;
