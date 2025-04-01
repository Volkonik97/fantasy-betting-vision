
import React from "react";
import { Badge } from "../ui/badge";
import { getRoleIconPath } from "./RoleBadge";

interface PlayerImageProps {
  name: string;
  image?: string;
  role?: string;
}

const PlayerImage: React.FC<PlayerImageProps> = ({ name, image, role }) => {
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
      
      <div className="absolute top-2 left-2 flex gap-2 items-center">
        <Badge variant="outline" className="bg-black/50 text-white border-none px-2 py-1 text-xs">
          {name}
        </Badge>
        {role && (
          <div className="bg-black/50 rounded-full p-1">
            <img 
              src={getRoleIconPath(role)} 
              alt={`${role} icon`}
              width={16}
              height={16}
              className="w-4 h-4 object-contain" 
              onError={(e) => {
                console.error(`Failed to load role icon for ${role}`);
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerImage;
