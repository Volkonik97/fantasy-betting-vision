
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Player } from "@/utils/models/types";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, FileImage, Upload } from "lucide-react";

interface PlayerImageCardProps {
  playerData: {
    player: Player;
    imageFile: File | null;
    newImageUrl: string | null;
    processed: boolean;
  };
}

const PlayerImageCard = ({ playerData }: PlayerImageCardProps) => {
  // Déterminer l'état et le style de la carte
  const hasExistingImage = !!playerData.player.image;
  const hasNewImage = !!playerData.imageFile;
  const isProcessed = playerData.processed;
  
  let cardStyle = "border rounded-lg p-4 flex flex-col space-y-3 h-full";
  let statusIcon = null;
  
  if (isProcessed) {
    cardStyle += " border-green-300 bg-green-50";
    statusIcon = <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 gap-1 flex items-center"><CheckCircle2 className="h-3 w-3" /> Téléchargée</Badge>;
  } else if (hasNewImage) {
    cardStyle += " border-blue-300 bg-blue-50";
    statusIcon = <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 gap-1 flex items-center"><Upload className="h-3 w-3" /> En attente</Badge>;
  } else if (!hasExistingImage) {
    cardStyle += " border-red-100 bg-red-50";
    statusIcon = <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 gap-1 flex items-center"><FileImage className="h-3 w-3" /> Aucune image</Badge>;
  } else {
    cardStyle += " border-gray-200";
  }

  return (
    <div className={cardStyle}>
      <div className="flex items-center space-x-3">
        <Avatar className="h-14 w-14 rounded-full overflow-hidden border-2 border-white shadow-sm">
          <AvatarImage 
            src={playerData.newImageUrl || playerData.player.image || undefined} 
            alt={playerData.player.name}
            className="object-cover"
            onError={(e) => {
              console.error(`Erreur de chargement d'image pour ${playerData.player.name}:`, e);
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = "/placeholder.svg";
            }}
          />
          <AvatarFallback className="bg-gray-200 text-gray-600 font-semibold">
            {playerData.player.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{playerData.player.name}</p>
          <p className="text-xs text-gray-500 truncate">{playerData.player.role}</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        {statusIcon}
        
        {playerData.player.image && !playerData.newImageUrl && !playerData.processed && (
          <span className="text-[10px] text-gray-500 truncate max-w-[150px]" title={playerData.player.image}>
            {playerData.player.image.substring(0, 25)}...
          </span>
        )}
      </div>
    </div>
  );
};

export default PlayerImageCard;
