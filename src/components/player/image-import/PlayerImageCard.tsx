
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayerWithImage } from "./types";
import { Check, X, Upload, Image as ImageIcon } from "lucide-react";
import { hasPlayerImage } from "./types";

interface PlayerImageCardProps {
  playerData: PlayerWithImage;
}

const PlayerImageCard: React.FC<PlayerImageCardProps> = ({ playerData }) => {
  const { player, imageFile, newImageUrl, isUploading, processed, error } = playerData;
  
  const displayImageUrl = newImageUrl || player.image || null;
  const hasExistingImage = hasPlayerImage(player);
  const hasNewImage = Boolean(imageFile);
  
  const getStatusIcon = () => {
    if (error) return <X className="h-4 w-4 text-red-500" />;
    if (processed) return <Check className="h-4 w-4 text-green-500" />;
    if (isUploading) return <Upload className="h-4 w-4 text-blue-500 animate-pulse" />;
    if (hasNewImage) return <Upload className="h-4 w-4 text-blue-500" />;
    return null;
  };
  
  const getStatusText = () => {
    if (error) return <Badge variant="destructive">Erreur</Badge>;
    if (processed) return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">Téléchargé</Badge>;
    if (isUploading) return <Badge variant="secondary">En cours...</Badge>;
    if (hasNewImage) return <Badge variant="outline">Prêt à télécharger</Badge>;
    if (hasExistingImage) return <Badge variant="outline">Image existante</Badge>;
    return <Badge variant="outline">Aucune image</Badge>;
  };
  
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="aspect-square w-full relative bg-gray-100 flex items-center justify-center">
        {displayImageUrl ? (
          <img 
            src={displayImageUrl} 
            alt={player.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <ImageIcon className="h-16 w-16" />
            <p className="text-sm">Pas d'image</p>
          </div>
        )}
        
        {hasNewImage && (
          <div className="absolute top-2 right-2">
            {getStatusIcon()}
          </div>
        )}
      </div>
      
      <CardContent className="p-4 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="font-medium truncate" title={player.name}>
            {player.name}
          </h3>
          <p className="text-sm text-gray-500 truncate" title={player.role}>
            {player.role}
          </p>
        </div>
        
        <div className="mt-2 flex items-center justify-between">
          {getStatusText()}
          
          {error && (
            <div className="text-xs text-red-500 mt-1 truncate" title={error}>
              {error}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerImageCard;
