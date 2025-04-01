
import React from "react";

interface PlayerImageProps {
  name: string;
  image?: string;
}

const PlayerImage: React.FC<PlayerImageProps> = ({ name, image }) => {
  return (
    <div className="h-48 bg-gray-50 relative">
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
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <span className="text-5xl font-bold text-gray-300">{name.charAt(0)}</span>
        </div>
      )}
    </div>
  );
};

export default PlayerImage;
