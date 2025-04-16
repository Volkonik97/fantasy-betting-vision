
import React, { useState, useEffect } from "react";
import { Badge } from "../ui/badge";
import { getRoleColor, getRoleDisplayName } from "./RoleBadge";
import { verifyImageExists } from "@/utils/database/teams/images/imageUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface PlayerImageProps {
  name: string;
  image?: string | null;
  role?: string;
}

const PlayerImage: React.FC<PlayerImageProps> = ({ name, image, role }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const processImageUrl = async () => {
      if (!image) {
        console.log(`Pas d'image fournie pour le joueur: ${name}`);
        setImageError(true);
        setIsLoading(false);
        return;
      }

      // Trim any whitespace that might cause inconsistency
      const cleanImageUrl = image.trim();
      console.log(`Traitement de l'image pour ${name}: ${cleanImageUrl}`);

      try {
        // Si c'est une URL complète de Supabase storage, l'utiliser directement
        if (cleanImageUrl.includes('supabase.co/storage') && cleanImageUrl.includes('player-images')) {
          console.log(`URL Supabase storage détectée pour ${name}: ${cleanImageUrl}`);
          setImageUrl(cleanImageUrl);
        }
        // Si c'est une URL complète externe, l'utiliser directement
        else if (cleanImageUrl.startsWith('http')) {
          console.log(`URL externe détectée pour ${name}: ${cleanImageUrl}`);
          setImageUrl(cleanImageUrl);
        }
        // Si c'est un chemin relatif vers le dossier public, ajouter un / au début
        else if (cleanImageUrl.startsWith('lovable-uploads/')) {
          console.log(`Chemin relatif détecté pour ${name}: ${cleanImageUrl}`);
          setImageUrl(`/${cleanImageUrl}`);
        }
        // Si c'est juste un nom de fichier, construire l'URL Supabase storage
        else if (!cleanImageUrl.includes('/')) {
          // Construire l'URL Supabase storage
          const { data: publicUrl } = supabase
            .storage
            .from('player-images')
            .getPublicUrl(cleanImageUrl);
            
          console.log(`URL Supabase construite pour ${name}: ${publicUrl.publicUrl}`);
          setImageUrl(publicUrl.publicUrl);
        }
        // Pour tout autre format, utiliser tel quel
        else {
          setImageUrl(cleanImageUrl);
        }
      } catch (error) {
        console.error(`Erreur lors du traitement de l'image pour ${name}:`, error);
        setImageError(true);
      } finally {
        setIsLoading(false);
      }
    };

    // Réinitialiser les états quand l'image change
    setImageError(false);
    setIsLoading(true);
    processImageUrl();
  }, [image, name]);

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
            console.log(`Image pour joueur ${name} chargée avec succès`);
            setIsLoading(false);
          }}
          onError={(e) => {
            console.error(`Erreur de chargement d'image pour joueur ${name}: ${imageUrl}`);
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
