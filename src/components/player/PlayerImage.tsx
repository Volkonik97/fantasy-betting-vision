
import React from "react";
import { Badge } from "../ui/badge";

interface PlayerImageProps {
  name: string;
  image?: string;
}

const PlayerImage: React.FC<PlayerImageProps> = ({ name, image }) => {
  return (
    <div className="h-48 bg-gray-50 relative overflow-hidden group">
      {image ? (
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null; // Prevent infinite error loop
            target.src = "/placeholder.svg";
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
          <span className="text-5xl font-bold text-gray-300">{name.charAt(0).toUpperCase()}</span>
        </div>
      )}
      
      <div className="absolute top-2 left-2">
        <Badge variant="outline" className="bg-black/50 text-white border-none px-2 py-1 text-xs">
          {name}
        </Badge>
      </div>
    </div>
  );
};

export default PlayerImage;
