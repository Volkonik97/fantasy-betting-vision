
import React, { useState, useEffect } from "react";
import { Badge } from "../ui/badge";
import { getRoleColor, getRoleDisplayName } from "./RoleBadge";
import { verifyImageExists } from "@/utils/database/teams/images/verifyImage";

interface PlayerImageProps {
  name: string;
  image?: string;
  role?: string;
}

const PlayerImage: React.FC<PlayerImageProps> = ({ name, image, role }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verify image URL is valid on component mount
  useEffect(() => {
    const checkImageUrl = async () => {
      if (image) {
        console.log(`PlayerImage component for ${name} checking image URL:`, image);
        try {
          // Always try to load the image regardless of verification result
          // The onError handler will catch any loading failures
          setImageError(false);
        } catch (err) {
          console.error(`Error checking image for ${name}:`, err);
          setImageError(true);
        }
      } else {
        // No image URL provided
        setImageError(true);
        setIsLoading(false);
      }
    };
    
    checkImageUrl();
  }, [image, name]);

  return (
    <div className="h-48 bg-gray-50 relative overflow-hidden group">
      {isLoading && (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 absolute z-10">
          <div className="animate-pulse w-12 h-12 bg-gray-200 rounded-full"></div>
        </div>
      )}
      
      {image && !imageError ? (
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onLoad={() => {
            console.log(`Image for player ${name} loaded successfully:`, image);
            setIsLoading(false);
          }}
          onError={(e) => {
            console.error(`Image load error for player ${name}:`, image);
            setImageError(true);
            setIsLoading(false);
            const target = e.target as HTMLImageElement;
            target.onerror = null; // Prevent infinite error loop
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
