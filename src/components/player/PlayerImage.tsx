
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Badge } from "../ui/badge";
import { getRoleColor, getRoleDisplayName } from "./RoleBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  const imageRef = useRef<HTMLImageElement>(null);

  // Clean up playerID to make sure it doesn't contain invalid characters
  const cleanPlayerId = playerId ? playerId.replace(/[^a-zA-Z0-9-_]/g, '') : null;

  // Helper to generate a direct Supabase URL for the player image
  const generateDirectImageUrl = useCallback((id: string) => {
    const { data } = supabase
      .storage
      .from('player-images')
      .getPublicUrl(`playerid${id}.png`);
    
    return `${data.publicUrl}?t=${Date.now()}`;
  }, []);

  // Effect to load the image URL
  useEffect(() => {
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
    
    // Try to use direct URL from player ID first (most reliable)
    if (cleanPlayerId) {
      try {
        const directUrl = generateDirectImageUrl(cleanPlayerId);
        console.log(`[PlayerImage] Generated direct URL for ${name}: ${directUrl}`);
        setImageUrl(directUrl);
      } catch (error) {
        console.error(`[PlayerImage] Error generating URL for ${name}:`, error);
        
        // Fall back to provided image URL if available
        if (image) {
          console.log(`[PlayerImage] Falling back to provided URL for ${name}: ${image}`);
          
          // Add cache buster if not already present
          const urlWithCacheBuster = image.includes('?') 
            ? image 
            : `${image}?t=${Date.now()}`;
            
          setImageUrl(urlWithCacheBuster);
        } else {
          setImageError(true);
          setIsLoading(false);
        }
      }
    } 
    // If no player ID but image URL is provided
    else if (image) {
      console.log(`[PlayerImage] Using provided URL for ${name}: ${image}`);
      
      // Add cache buster if not already present
      const urlWithCacheBuster = image.includes('?') 
        ? image 
        : `${image}?t=${Date.now()}`;
        
      setImageUrl(urlWithCacheBuster);
    }
  }, [image, cleanPlayerId, name, reloadAttempt, generateDirectImageUrl]);

  const handleImageLoad = () => {
    console.log(`[PlayerImage] Image loaded successfully for ${name}`);
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    console.log(`[PlayerImage] Image failed to load for ${name}: ${imageUrl}`);
    setImageError(true);
    setIsLoading(false);
  };
  
  const handleManualReload = () => {
    console.log(`[PlayerImage] Manual reload for ${name}`);
    
    // For direct player ID, regenerate the URL
    if (cleanPlayerId) {
      try {
        const directUrl = generateDirectImageUrl(cleanPlayerId);
        console.log(`[PlayerImage] Regenerated URL for ${name}: ${directUrl}`);
        
        // Clear URL first to force a complete reload
        setImageUrl(null);
        setTimeout(() => {
          setImageUrl(directUrl);
          setImageError(false);
          setIsLoading(true);
        }, 50);
        
        return;
      } catch (error) {
        console.error(`[PlayerImage] Error regenerating URL:`, error);
      }
    }
    
    // For other URLs, add a new cache buster
    if (imageUrl) {
      const baseUrl = imageUrl.split('?')[0];
      const newUrl = `${baseUrl}?t=${Date.now()}`;
      
      // Clear URL first to force a complete reload
      setImageUrl(null);
      setTimeout(() => {
        setImageUrl(newUrl);
        setImageError(false);
        setIsLoading(true);
      }, 50);
    }
    
    // Increment reload attempt counter
    setReloadAttempt(prev => prev + 1);
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
