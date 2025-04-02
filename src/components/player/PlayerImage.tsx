
import React from "react";
import { Badge } from "../ui/badge";

interface PlayerImageProps {
  name: string;
  image?: string;
  role?: string;
}

// Fonction pour obtenir la couleur de fond en fonction du rôle
const getRoleBgColor = (role: string): string => {
  switch (role.toLowerCase()) {
    case "top": return "bg-gradient-to-r from-red-600 to-red-500";
    case "jungle": return "bg-gradient-to-r from-green-600 to-green-500";
    case "mid": return "bg-gradient-to-r from-yellow-500 to-yellow-400";
    case "adc": return "bg-gradient-to-r from-blue-600 to-blue-500";
    case "support": return "bg-gradient-to-r from-purple-600 to-purple-500";
    default: return "bg-gradient-to-r from-gray-500 to-gray-400";
  }
};

// Fonction pour obtenir le nom d'affichage du rôle
const getRoleDisplayName = (role: string): string => {
  switch (role.toLowerCase()) {
    case "top": return "Top";
    case "jungle": return "Jungle";
    case "mid": return "Mid";
    case "adc": return "Bot";
    case "support": return "Support";
    default: return role;
  }
};

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
      </div>

      {role && (
        <div className={`absolute bottom-0 left-0 right-0 h-8 ${getRoleBgColor(role)} flex items-center justify-center shadow-md`}>
          <div className="flex items-center text-white font-medium">
            <span>{getRoleDisplayName(role)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerImage;
