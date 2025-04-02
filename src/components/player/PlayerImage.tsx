
import React from "react";

interface PlayerImageProps {
  name: string;
  image: string;
  role: string;
}

const PlayerImage = ({ name, image, role }: PlayerImageProps) => {
  // Add fallback image URL in case the provided URL is empty or invalid
  const fallbackImage = "/placeholder.svg";
  
  // Handle image loading errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.warn(`Failed to load image for player ${name}:`, image);
    const imgElement = e.currentTarget;
    imgElement.src = fallbackImage;
    imgElement.onerror = null; // Prevent infinite error loop
  };
  
  return (
    <div className="aspect-w-16 aspect-h-9 bg-gray-100">
      {image ? (
        <img 
          src={image} 
          alt={`${name} - ${role}`} 
          onError={handleImageError}
          className="w-full h-full object-cover object-center"
          loading="lazy"
        />
      ) : (
        <div className="flex items-center justify-center h-full bg-gray-100 text-gray-400">
          <span className="text-2xl font-bold">{name.charAt(0)}</span>
        </div>
      )}
    </div>
  );
};

export default PlayerImage;
