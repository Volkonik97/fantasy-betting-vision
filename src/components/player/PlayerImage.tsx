
import React, { useState, useEffect } from "react";
import { Badge } from "../ui/badge";
import { getRoleColor, getRoleDisplayName } from "./RoleBadge";
import { hasPlayerImage, normalizeImageUrl } from "@/utils/database/teams/images/imageUtils";
import { Skeleton } from "@/components/ui/skeleton";

interface PlayerImageProps {
  name: string;
  playerId?: string;
  image?: string | null;
  role?: string;
}

const PlayerImage: React.FC<PlayerImageProps> = ({ name, playerId, image, role }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const processImageUrl = async () => {
      // Si pas d'image mais un ID de joueur, essayer de construire l'URL à partir de l'ID
      if (!image && playerId) {
        console.log(`Tentative de construction d'URL pour le joueur ${name} avec ID: ${playerId}`);
        // Utiliser directement l'ID du joueur pour chercher une image
        const playerIdUrl = `playerid${playerId}`;
        setImageUrl(normalizeImageUrl(playerIdUrl));
        setIsLoading(false);
        return;
      }
      
      if (!image) {
        console.log(`Pas d'image fournie pour le joueur: ${name} (ID: ${playerId || 'non défini'})`);
        setImageError(true);
        setIsLoading(false);
        return;
      }

      try {
        // Normaliser l'URL de l'image
        const normalizedUrl = normalizeImageUrl(image);
        console.log(`Image normalisée pour ${name} (ID: ${playerId || 'non défini'}): ${normalizedUrl}`);
        
        if (normalizedUrl) {
          setImageUrl(normalizedUrl);
        } else {
          setImageError(true);
        }
      } catch (error) {
        console.error(`Erreur lors du traitement de l'image pour ${name} (ID: ${playerId || 'non défini'}):`, error);
        setImageError(true);
      } finally {
        setIsLoading(false);
      }
    };

    // Réinitialiser les états quand l'image change
    setImageError(false);
    setIsLoading(true);
    processImageUrl();
  }, [image, name, playerId]);

  return (
    <div className="h-48 bg-gray-50 relative overflow-hidden group">
      {isLoading && (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 absolute z-10">
          <Skeleton className="h-32 w-32 rounded-full" />
        </div>
      )}
      
      {imageUrl && !imageError ? (
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onLoad={() => {
            console.log(`Image pour joueur ${name} (ID: ${playerId || 'non défini'}) chargée avec succès: ${imageUrl}`);
            setIsLoading(false);
          }}
          onError={(e) => {
            console.error(`Erreur de chargement d'image pour joueur ${name} (ID: ${playerId || 'non défini'}): ${imageUrl}`);
            setImageError(true);
            setIsLoading(false);
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
          <span className="text-5xl font-bold text-gray-300">{name.charAt(0).toUpperCase()}</span>
        </div>
      )}
      
      <div className="absolute top-2 left-2 flex gap-2 items-center">
        <Badge variant="outline" className="bg-black/50 text-white border-none px-2 py-1 text-xs font-medium backdrop-blur-sm">
          {name}
        </Badge>
      </div>

      {role && (
        <div className={`absolute bottom-0 left-0 right-0 h-8 ${getRoleColor(role)} flex items-center justify-center shadow-md`}>
          <div className="flex items-center text-white font-medium">
            <span>{getRoleDisplayName(role)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerImage;
