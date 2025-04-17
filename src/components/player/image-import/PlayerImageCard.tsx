
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayerWithImage } from "./types";
import { Check, X, Upload, Image as ImageIcon, RefreshCw, Trash2 } from "lucide-react";
import { hasPlayerImage } from "./types";
import { normalizeImageUrl, forceImageReload, verifyImageAccessibleWithRetry } from "@/utils/database/teams/images/imageUtils"; 
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { clearInvalidImageReference } from "@/utils/database/teams/imageUtils";

interface PlayerImageCardProps {
  playerData: PlayerWithImage;
  onImageDeleted?: () => void;
}

const PlayerImageCard: React.FC<PlayerImageCardProps> = ({ playerData, onImageDeleted }) => {
  const { player, imageFile, newImageUrl, isUploading, processed, error } = playerData;
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [triedExtensions, setTriedExtensions] = useState<string[]>([]);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // Clean up player ID to make sure it doesn't contain invalid characters
  const cleanPlayerId = player.id ? player.id.replace(/[^a-zA-Z0-9-_]/g, '') : null;
  
  // Ensure we always have the latest image URL
  useEffect(() => {
    const updateImageUrl = async () => {
      // Priority: 1. newImageUrl (temporary preview) 2. player.image (from database)
      const imageSource = newImageUrl || player.image;
      
      if (imageSource) {
        try {
          // Special handling for blob URLs (file previews)
          if (imageSource.startsWith('blob:')) {
            console.log(`Using blob image directly for ${player.name}: ${imageSource}`);
            setDisplayUrl(imageSource);
            setLoadError(false);
          } else {
            const normalizedUrl = normalizeImageUrl(imageSource);
            console.log(`Setting display URL for ${player.name}:`, normalizedUrl);
            
            // If the image is from Supabase storage, verify it exists
            if (normalizedUrl && normalizedUrl.includes('supabase.co/storage')) {
              console.log(`Verifying Supabase storage image for ${player.name}`);
              const isAccessible = await verifyImageAccessibleWithRetry(normalizedUrl);
              if (!isAccessible) {
                console.warn(`Image for ${player.name} is not accessible: ${normalizedUrl}`);
                setLoadError(true);
              } else {
                setDisplayUrl(normalizedUrl);
                setLoadError(false);
              }
            } else {
              setDisplayUrl(normalizedUrl);
              setLoadError(false);
            }
          }
        } catch (error) {
          console.error(`Error setting display URL for ${player.name}:`, error);
          setLoadError(true);
        }
      } else {
        setDisplayUrl(null);
        setLoadError(true);
      }
    };
    
    updateImageUrl();
  }, [newImageUrl, player.image, processed, player.name, reloadTrigger, cleanPlayerId]);
  
  // Effect to retry with different file extensions if image fails to load
  useEffect(() => {
    if (loadError && displayUrl && !displayUrl.startsWith('blob:') && displayUrl.includes('supabase.co/storage')) {
      const tryNextExtension = async () => {
        const extensions = ['.png', '.jpg', '.jpeg', '.webp'];
        
        // Extract the base URL without extension and cache buster
        const baseUrlMatch = displayUrl.match(/(.+playerid[^.]+)(\.[^?]+)?(\?.+)?$/);
        
        if (baseUrlMatch) {
          const baseUrl = baseUrlMatch[1]; // playerid part
          const currentExt = baseUrlMatch[2] || '.png'; // current extension or default
          
          // Find extensions we haven't tried yet
          const remainingExts = extensions.filter(ext => 
            !triedExtensions.includes(ext) && ext !== currentExt
          );
          
          if (remainingExts.length > 0) {
            const nextExt = remainingExts[0];
            const newTriedExtensions = [...triedExtensions, nextExt];
            setTriedExtensions(newTriedExtensions);
            
            const newUrl = `${baseUrl}${nextExt}?t=${Date.now()}`;
            console.log(`Trying alternate extension for ${player.name}: ${nextExt}`, newUrl);
            
            setDisplayUrl(newUrl);
          } else {
            // All extensions tried, reset and set regular retry timer
            console.log(`All extensions tried for ${player.name}, starting over`);
            setTriedExtensions([]);
          }
        }
      };
      
      // Try next extension after a short delay
      const timeout = setTimeout(() => {
        tryNextExtension();
      }, 1000);
      
      return () => clearTimeout(timeout);
    }
  }, [loadError, displayUrl, player.name, triedExtensions]);
  
  // Effect to retry failed images regularly
  useEffect(() => {
    let retryTimeout: NodeJS.Timeout;
    
    if (loadError && displayUrl && !displayUrl.startsWith('blob:')) {
      retryTimeout = setTimeout(() => {
        console.log(`Auto-retrying image load for ${player.name}`);
        reloadImage();
      }, 3000); // Retry every 3 seconds
    }
    
    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [loadError, displayUrl, player.name]);
  
  const hasExistingImage = hasPlayerImage(player);
  const hasNewImage = Boolean(imageFile);

  // When an image is processed (upload completed), schedule additional reloads
  useEffect(() => {
    if (processed && hasNewImage) {
      console.log(`Player ${player.name} image processed, scheduling additional reloads`);
      
      // Reset tried extensions when a new image is processed
      setTriedExtensions([]);
      
      const timeouts = [500, 1500, 3000, 5000, 8000].map(delay => 
        setTimeout(() => {
          console.log(`Post-processing reload for ${player.name}: ${delay}ms delay`);
          reloadImage();
        }, delay)
      );
      
      return () => timeouts.forEach(t => clearTimeout(t));
    }
  }, [processed, hasNewImage, player.name]);
  
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
  
  const handleImageError = () => {
    console.log(`Image load error for player ${player.name}`);
    setLoadError(true);
  };
  
  const handleImageLoad = () => {
    console.log(`Image loaded successfully for player ${player.name}`);
    setLoadError(false);
  };
  
  const reloadImage = () => {
    if (displayUrl) {
      if (displayUrl.startsWith('blob:')) {
        // For blob URLs, just refresh the state to trigger a re-render
        console.log(`Forcing refresh of blob image for ${player.name}`);
        setLoadError(false);
        // Force a re-render by toggling a state
        setDisplayUrl(null);
        setTimeout(() => setDisplayUrl(displayUrl), 10);
      } else {
        // For regular URLs, use the utility function to force reload
        setDisplayUrl(null); // Clear first
        setTimeout(() => {
          const reloadUrl = forceImageReload(displayUrl);
          console.log(`Reloading image for ${player.name} with URL:`, reloadUrl);
          setDisplayUrl(reloadUrl);
          setLoadError(false);
          setReloadTrigger(prev => prev + 1);
        }, 50);
      }
    }
  };

  const handleDeleteImage = async () => {
    if (!player.id) return;

    setIsDeleting(true);
    
    try {
      const success = await clearInvalidImageReference(player.id);
      
      if (success) {
        toast.success(`L'image de ${player.name} a été supprimée`);
        if (onImageDeleted) {
          onImageDeleted();
        }
      } else {
        toast.error(`Échec de la suppression de l'image de ${player.name}`);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'image:", error);
      toast.error("Une erreur est survenue lors de la suppression de l'image");
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <Card className="overflow-hidden h-full flex flex-col group">
      <div className="aspect-square w-full relative bg-gray-100 flex items-center justify-center">
        {displayUrl && !loadError ? (
          <img 
            ref={imageRef}
            src={displayUrl} 
            alt={player.name} 
            className="w-full h-full object-cover"
            onError={handleImageError}
            onLoad={handleImageLoad}
            crossOrigin="anonymous"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 p-4 text-center">
            <ImageIcon className="h-16 w-16" />
            <p className="text-sm mt-2">Pas d'image</p>
            {loadError && (
              <Button 
                variant="ghost"
                size="sm"
                onClick={reloadImage}
                className="mt-2 flex items-center text-xs text-blue-500 hover:text-blue-700"
              >
                <RefreshCw className="h-3 w-3 mr-1" /> Recharger
              </Button>
            )}
          </div>
        )}
        
        {/* Badge d'état */}
        <div className="absolute top-2 left-2">
          {getStatusText()}
        </div>

        {/* Toujours afficher le bouton de suppression si l'image existe ou si une image est en attente de téléchargement */}
        {(hasExistingImage || hasNewImage) && (
          <div className="absolute top-2 right-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm"
                  className="bg-red-500 hover:bg-red-600 h-7 px-2"
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer l'image</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir supprimer l'image de {player.name} ? 
                    Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteImage}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting ? "Suppression..." : "Supprimer"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
