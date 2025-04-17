
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Badge } from "../ui/badge";
import { getRoleColor, getRoleDisplayName } from "./RoleBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { normalizeImageUrl, forceImageReload } from "@/utils/database/teams/images/imageUtils";
import { getDirectPlayerImageUrl } from "@/utils/database/teams/getDirectImageUrl";

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
  const [reloadAttempt, setReloadAttempt] = useState(0);
  const [triedExtensions, setTriedExtensions] = useState<string[]>([]);
  const imageRef = useRef<HTMLImageElement>(null);

  // Clean up playerID to make sure it doesn't contain invalid characters
  const cleanPlayerId = playerId ? playerId.replace(/[^a-zA-Z0-9-_]/g, '') : null;

  // Effet pour générer et tenter différentes URLs d'images
  useEffect(() => {
    const attemptToLoadImage = () => {
      if (!cleanPlayerId && !image) {
        console.log(`[PlayerImage] No image data for ${name}`);
        setImageError(true);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setImageError(false);
      
      // Handle blob URLs (for previews)
      if (image && image.startsWith('blob:')) {
        console.log(`[PlayerImage] Using blob image for ${name}: ${image}`);
        setImageUrl(image);
        return;
      }
      
      // Essayer les extensions par ordre de priorité
      const extensions = ['.webp', '.png', '.jpg', '.jpeg'];
      const currentExtension = triedExtensions.length > 0 ? 
        triedExtensions[triedExtensions.length - 1] : extensions[0];
      
      try {
        if (cleanPlayerId) {
          // Ajouter un timestamp pour éviter le cache
          const timestamp = Date.now();
          // Construire une URL basée sur l'ID du joueur et l'extension actuelle
          const baseUrl = getDirectPlayerImageUrl(cleanPlayerId).split('.')[0];
          const directUrl = `${baseUrl}${currentExtension}?t=${timestamp}`;
          
          console.log(`[PlayerImage] Trying URL for ${name} with ${currentExtension}: ${directUrl}`);
          setImageUrl(directUrl);
          
          // Si nous avons déjà essayé toutes les extensions, réinitialiser
          if (triedExtensions.length >= extensions.length) {
            console.log(`[PlayerImage] Tried all extensions for ${name}, resetting`);
            setTriedExtensions([]);
          }
        } else if (image) {
          // Si seule une URL d'image est fournie, la normaliser et l'utiliser
          const normalizedUrl = normalizeImageUrl(image);
          console.log(`[PlayerImage] Using normalized URL for ${name}: ${normalizedUrl}`);
          setImageUrl(normalizedUrl);
        } else {
          setImageError(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error(`[PlayerImage] Error generating URL for ${name}:`, error);
        setImageError(true);
        setIsLoading(false);
      }
    };
    
    attemptToLoadImage();
  }, [image, cleanPlayerId, name, reloadAttempt, triedExtensions]);

  const handleImageLoad = () => {
    console.log(`[PlayerImage] Image loaded successfully for ${name}`);
    setIsLoading(false);
    setImageError(false);
    // Réinitialiser les extensions essayées après un chargement réussi
    setTriedExtensions([]);
  };

  const handleImageError = useCallback(() => {
    console.log(`[PlayerImage] Image failed to load for ${name}: ${imageUrl}`);
    
    // Si nous avons une ID de joueur, essayons une autre extension
    if (cleanPlayerId) {
      const extensions = ['.webp', '.png', '.jpg', '.jpeg'];
      const nextExtension = extensions.find(ext => !triedExtensions.includes(ext));
      
      if (nextExtension) {
        console.log(`[PlayerImage] Trying next extension for ${name}: ${nextExtension}`);
        setTriedExtensions(prev => [...prev, nextExtension]);
        return;
      }
    }
    
    // Si toutes les extensions ont échoué ou si nous n'avons pas d'ID de joueur
    setImageError(true);
    setIsLoading(false);
  }, [imageUrl, name, cleanPlayerId, triedExtensions]);

  const handleManualReload = () => {
    console.log(`[PlayerImage] Manual reload for ${name}`);
    
    // Incrémenter le compteur pour forcer un rechargement complet
    setReloadAttempt(prev => prev + 1);
    
    // Réinitialiser l'état
    setImageError(false);
    setIsLoading(true);
    setTriedExtensions([]);
    
    // Si nous avons une URL d'image, essayer de l'actualiser
    if (imageUrl) {
      const reloadedUrl = forceImageReload(imageUrl);
      
      // Effacer d'abord l'URL pour forcer un rechargement complet
      setImageUrl(null);
      setTimeout(() => {
        setImageUrl(reloadedUrl);
      }, 50);
    }
  };

  return (
    <div className="h-48 bg-gray-50 relative overflow-hidden group">
      {isLoading && !imageError && (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 absolute z-10">
          <Skeleton className="h-32 w-32 rounded-full" />
        </div>
      )}
      
      {imageUrl && !imageError ? (
        <img
          ref={imageRef}
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onLoad={handleImageLoad}
          onError={handleImageError}
          crossOrigin="anonymous"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
          <span className="text-5xl font-bold text-gray-300">{name.charAt(0).toUpperCase()}</span>
          <p className="text-gray-400 mt-2">Pas d'image</p>
          {imageError && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2 text-xs text-blue-500 hover:text-blue-700 flex items-center"
              onClick={handleManualReload}
            >
              <RefreshCw className="h-3 w-3 mr-1" /> Recharger
            </Button>
          )}
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
