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
  playerId?: string | null;
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

  // Effect for generating and trying different image URLs
  useEffect(() => {
    const attemptToLoadImage = () => {
      // If we have no image data and no player ID, we can't load an image
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
      
      // Try extensions in priority order
      const extensions = ['.webp', '.png', '.jpg', '.jpeg'];
      
      try {
        if (cleanPlayerId) {
          // Generate player image URL from player ID
          let imageUrl = cleanPlayerId;
          
          // If we have a specific image URL, use that
          if (image) {
            const normalizedUrl = normalizeImageUrl(image);
            if (normalizedUrl) {
              console.log(`[PlayerImage] Using provided image URL for ${name}: ${normalizedUrl}`);
              setImageUrl(normalizedUrl);
              return;
            }
          }
          
          // Otherwise, try to construct a URL from the player ID
          const directUrl = getDirectPlayerImageUrl(cleanPlayerId);
          console.log(`[PlayerImage] Generated URL for ${name}: ${directUrl}`);
          
          // Add timestamp to avoid caching issues
          const forcedUrl = forceImageReload(directUrl);
          setImageUrl(forcedUrl);
        } else if (image) {
          // If only an image URL is provided, normalize and use it
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
  }, [image, cleanPlayerId, name, reloadAttempt]);

  const handleImageLoad = () => {
    console.log(`[PlayerImage] Image loaded successfully for ${name}`);
    setIsLoading(false);
    setImageError(false);
    // Reset tried extensions after successful load
    setTriedExtensions([]);
  };

  const handleImageError = useCallback(() => {
    console.log(`[PlayerImage] Image failed to load for ${name}: ${imageUrl}`);
    
    // If we have a player ID, try another extension
    if (cleanPlayerId) {
      const extensions = ['.webp', '.png', '.jpg', '.jpeg'];
      const nextExtension = extensions.find(ext => !triedExtensions.includes(ext));
      
      if (nextExtension) {
        console.log(`[PlayerImage] Trying next extension for ${name}: ${nextExtension}`);
        setTriedExtensions(prev => [...prev, nextExtension]);
        
        // Construct a new URL with the next extension
        const baseUrl = `https://nbioauymqggfafmsuigr.supabase.co/storage/v1/object/public/player-images/playerid${cleanPlayerId}`;
        const newUrl = `${baseUrl}${nextExtension}?t=${Date.now()}`;
        setImageUrl(newUrl);
        return;
      }
    }
    
    // If all extensions have failed or if we don't have a player ID
    setImageError(true);
    setIsLoading(false);
  }, [imageUrl, name, cleanPlayerId, triedExtensions]);

  const handleManualReload = () => {
    console.log(`[PlayerImage] Manual reload for ${name}`);
    
    // Increment counter to force a complete reload
    setReloadAttempt(prev => prev + 1);
    
    // Reset state
    setImageError(false);
    setIsLoading(true);
    setTriedExtensions([]);
    
    // If we have an image URL, try to refresh it
    if (imageUrl) {
      const reloadedUrl = forceImageReload(imageUrl);
      
      // First clear the URL to force a complete reload
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
