
import React from "react";
import { Badge } from "../ui/badge";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import { Shield } from "lucide-react";

interface PlayerImageProps {
  name: string;
  image?: string;
  role?: string;
}

const PlayerImage: React.FC<PlayerImageProps> = ({ name, image, role }) => {
  return (
    <div className="h-48 bg-gray-50 relative overflow-hidden group">
      <ImageWithFallback
        src={image}
        alt={name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        fallback={
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <Shield className="h-12 w-12 text-gray-300 mb-2" />
            <span className="text-2xl font-bold text-gray-400">{name.charAt(0).toUpperCase()}</span>
          </div>
        }
      />
      
      <div className="absolute top-2 left-2 flex gap-2 items-center">
        <Badge variant="outline" className="bg-black/50 text-white border-none px-2 py-1 text-xs">
          {name}
        </Badge>
      </div>
    </div>
  );
};

export default PlayerImage;
