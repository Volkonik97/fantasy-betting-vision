
import React, { useState, useEffect } from "react";
import { Badge } from "../ui/badge";
import { getRoleColor, getRoleDisplayName } from "./RoleBadge";
import { verifyImageExists } from "@/utils/database/teams/images/verifyImage";
import { toast } from "sonner";

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
        console.log(`No image provided for player: ${name}`);
        setImageError(true);
        setIsLoading(false);
        return;
      }

      console.log(`Processing image for ${name}: ${image}`);

      // If it's a full URL, use it directly
      if (image.startsWith('http')) {
        setImageUrl(image);
      }
      // If it's a relative path to public folder, prepend with /
      else if (image.startsWith('lovable-uploads/')) {
        setImageUrl(`/${image}`);
      }
      // If it's just a filename, assume it's in the player-images bucket
      else if (!image.includes('/')) {
        // Construct the Supabase storage URL
        const publicUrl = supabaseStorageUrl(image);
        console.log(`Constructed Supabase URL: ${publicUrl}`);
        setImageUrl(publicUrl);

        // Verify the image exists
        const exists = await verifyImageExists(publicUrl);
        if (!exists) {
          console.warn(`Image does not exist in storage: ${publicUrl}`);
          setImageError(true);
        }
      }
      // For any other format, use as is and hope for the best
      else {
        setImageUrl(image);
      }
    };

    // Reset states when image prop changes
    setImageError(false);
    setIsLoading(true);
    processImageUrl();
  }, [image, name]);

  // Helper function to construct Supabase storage URL
  const supabaseStorageUrl = (filename: string): string => {
    return `https://dtddoxxazhmfudrvpszu.supabase.co/storage/v1/object/public/player-images/${filename}`;
  };

  return (
    <div className="h-48 bg-gray-50 relative overflow-hidden group">
      {isLoading && (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 absolute z-10">
          <div className="animate-pulse w-12 h-12 bg-gray-200 rounded-full"></div>
        </div>
      )}
      
      {imageUrl && !imageError ? (
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onLoad={() => {
            console.log(`Image for player ${name} loaded successfully`);
            setIsLoading(false);
          }}
          onError={(e) => {
            console.error(`Image load error for player ${name}: ${imageUrl}`);
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
        <Badge variant="outline" className="bg-black/50 text-white border-none px-2 py-1 text-xs">
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
