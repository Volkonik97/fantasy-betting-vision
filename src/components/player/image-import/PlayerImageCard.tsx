import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { supabase } from "@/integrations/supabase/client";

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
  
  const cleanPlayerId = player.id ? player.id.replace(/[^a-zA-Z0-9-_]/g, '') : null;
  
  const generateDirectImageUrl = useCallback(() => {
    if (!cleanPlayerId) return null;
    
    const { data } = supabase
      .storage
      .from('player-images')
      .getPublicUrl(`playerid${cleanPlayerId}.png`);
    
    const url = `${data.publicUrl}?t=${Date.now()}`;
    console.log(`[PlayerImageCard] Generated direct URL for ${player.name}: ${url}`);
    return url;
  }, [cleanPlayerId, player.name]);
  
  useEffect(() => {
    const updateImageUrl = async () => {
      const imageSource = newImageUrl || player.image;
      
      if (imageSource) {
        try {
          if (imageSource.startsWith('blob:')) {
            console.log(`Using blob image directly for ${player.name}: ${imageSource}`);
            setDisplayUrl(imageSource);
            setLoadError(false);
          } else {
            const normalizedUrl = normalizeImageUrl(imageSource);
            console.log(`Setting display URL for ${player.name}:`, normalizedUrl);
            
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
  
  useEffect(() => {
    if (loadError && displayUrl && !displayUrl.startsWith('blob:') && displayUrl.includes('supabase.co/storage')) {
      const tryNextExtension = async () => {
        const extensions = ['.png', '.jpg', '.jpeg', '.webp'];
        
        const baseUrlMatch = displayUrl.match(/(.+playerid[^.]+)(\.[^?]+)?(\?.+)?$/);
        
        if (baseUrlMatch) {
          const baseUrl = baseUrlMatch[1];
          const currentExt = baseUrlMatch[2] || '.png';
          
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
            console.log(`All extensions tried for ${player.name}, starting over`);
            setTriedExtensions([]);
          }
        }
      };
      
      const timeout = setTimeout(() => {
        tryNextExtension();
      }, 1000);
      
      return () => clearTimeout(timeout);
    }
  }, [loadError, displayUrl, player.name, triedExtensions]);
  
  useEffect(() => {
    let retryTimeout: NodeJS.Timeout;
    
    if (loadError && displayUrl && !displayUrl.startsWith('blob:')) {
      retryTimeout = setTimeout(() => {
        console.log(`Auto-retrying image load for ${player.name}`);
        reloadImage();
      }, 3000);
    }
    
    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [loadError, displayUrl, player.name]);
  
  const hasExistingImage = hasPlayerImage(player);
  const hasNewImage = Boolean(imageFile);

  useEffect(() => {
    if (processed && hasNewImage) {
      console.log(`Player ${player.name} image processed, scheduling additional reloads`);
      
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
        setDisplayUrl(null);
        setTimeout(() => setDisplayUrl(displayUrl), 10);
      } else {
        setDisplayUrl(null);
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
        {player.player.image ? (
          <img
            src={player.player.image}
            alt={`Portrait de ${player.player.name}`}
            className="w-full h-full object-cover"
            onError={handleImageError}
            onLoad={handleImageLoad}
            crossOrigin="anonymous"
          />
        ) : (
          <div className="text-gray-400 text-sm text-center">Pas d'image</div>
        )}
        
        <div className="absolute top-2 left-2">
          {getStatusText()}
        </div>

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
