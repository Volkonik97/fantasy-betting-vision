
import React, { useState, useEffect } from "react";
import { Badge } from "../ui/badge";
import { getRoleColor, getRoleDisplayName } from "./RoleBadge";
import { normalizeImageUrl, forceImageReload, verifyImageAccessibleWithRetry } from "@/utils/database/teams/images/imageUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

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
  const [hasVerifiedImage, setHasVerifiedImage] = useState(false);

  // Effect to load the image URL
  useEffect(() => {
    const loadImage = async () => {
      setIsLoading(true);
      setImageError(false);
      
      // First try to use the provided image URL
      if (image) {
        try {
          // For blob URLs, we need special handling
          if (image.startsWith('blob:')) {
            console.log(`Using blob image directly for ${name}: ${image}`);
            setImageUrl(image);
          } else {
            const normalizedUrl = normalizeImageUrl(image);
            console.log(`Loading image for ${name} from URL: ${normalizedUrl}`);
            setImageUrl(normalizedUrl);
          }
        } catch (error) {
          console.error(`Error normalizing image URL for ${name}:`, error);
          setImageError(true);
          setIsLoading(false);
        }
      } 
      // If no image provided but we have a player ID, construct URL from player ID
      else if (playerId) {
        try {
          const playerIdUrl = normalizeImageUrl(`playerid${playerId}`);
          console.log(`Loading image for ${name} from player ID: ${playerIdUrl}`);
          setImageUrl(playerIdUrl);
        } catch (error) {
          console.error(`Error creating player ID URL for ${name}:`, error);
          setImageError(true);
          setIsLoading(false);
        }
      }
      // No image data available
      else {
        console.log(`No image available for ${name}`);
        setImageError(true);
        setIsLoading(false);
      }
    };

    loadImage();
  }, [image, playerId, reloadAttempt]);

  // Effect to verify the image is accessible
  useEffect(() => {
    if (imageUrl && !hasVerifiedImage) {
      const verifyImage = async () => {
        try {
          const isAccessible = await verifyImageAccessibleWithRetry(imageUrl);
          console.log(`Image verification for ${name}: ${isAccessible ? 'accessible' : 'not accessible'}`);
          
          if (!isAccessible) {
            setImageError(true);
            setIsLoading(false);
          }
          
          setHasVerifiedImage(true);
        } catch (error) {
          console.error(`Error verifying image for ${name}:`, error);
        }
      };
      
      verifyImage();
    }
  }, [imageUrl, hasVerifiedImage, name]);

  const handleImageLoad = () => {
    console.log(`Image loaded successfully for ${name}`);
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    console.log(`Image failed to load for ${name}`);
    setImageError(true);
    setIsLoading(false);
  };
  
  const handleManualReload = () => {
    if (imageUrl) {
      console.log(`Manually reloading image for ${name}`);
      // Clear the current URL first so React fully remounts the image
      setImageUrl(null);
      // Small delay before setting the new URL
      setTimeout(() => {
        const reloadedUrl = forceImageReload(imageUrl);
        setImageUrl(reloadedUrl);
        setImageError(false);
        setIsLoading(true);
        setHasVerifiedImage(false);
        setReloadAttempt(prev => prev + 1);
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
