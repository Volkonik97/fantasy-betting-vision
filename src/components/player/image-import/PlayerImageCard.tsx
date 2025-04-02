
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Player } from "@/utils/models/types";

interface PlayerImageCardProps {
  playerData: {
    player: Player;
    imageFile: File | null;
    newImageUrl: string | null;
    processed: boolean;
  };
}

const PlayerImageCard = ({ playerData }: PlayerImageCardProps) => {
  return (
    <div 
      className={`border rounded-lg p-3 flex items-center space-x-3 ${
        playerData.processed 
          ? 'border-green-300 bg-green-50' 
          : playerData.imageFile 
            ? 'border-blue-300 bg-blue-50' 
            : !playerData.player.image
              ? 'border-red-100 bg-red-50'
              : 'border-gray-200'
      }`}
    >
      <Avatar className="h-12 w-12 rounded-full overflow-hidden">
        <AvatarImage 
          src={playerData.newImageUrl || playerData.player.image} 
          alt={playerData.player.name}
          onError={(e) => {
            console.error(`Error loading image for ${playerData.player.name}:`, e);
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = "/placeholder.svg";
          }}
        />
        <AvatarFallback>{playerData.player.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{playerData.player.name}</p>
        <p className="text-xs text-gray-500 truncate">{playerData.player.role}</p>
        {playerData.player.image && (
          <p className="text-xs text-gray-600 truncate" title={playerData.player.image}>
            {playerData.player.image ? "Image URL: " + playerData.player.image.substring(0, 20) + "..." : "Pas d'image"}
          </p>
        )}
        {!playerData.player.image && !playerData.newImageUrl && (
          <p className="text-xs text-red-600">Pas d'image</p>
        )}
        {playerData.imageFile && !playerData.processed && (
          <p className="text-xs text-blue-600">Nouvelle image sélectionnée</p>
        )}
        {playerData.processed && (
          <p className="text-xs text-green-600">Téléchargée avec succès</p>
        )}
      </div>
    </div>
  );
};

export default PlayerImageCard;
