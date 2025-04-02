
import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ImageWithFallback from "@/components/ui/ImageWithFallback";

interface TeamLogoProps {
  logoUrl: string | null;
  teamName: string;
  onError: () => void;
  hasError: boolean;
}

const TeamLogo: React.FC<TeamLogoProps> = ({ logoUrl, teamName, onError, hasError }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const handleImageError = () => {
    console.log(`TeamLogo: Error loading logo for ${teamName}`);
    onError();
    // Only trigger one more refresh attempt if error occurs
    if (refreshTrigger === 0) {
      console.log(`TeamLogo: Retrying logo for ${teamName}`);
      setRefreshTrigger(1);
    }
  };
  
  const handleImageLoad = () => {
    console.log(`TeamLogo: Successfully loaded logo for ${teamName}`);
  };
  
  return (
    <div className="w-12 h-12 bg-gray-50 rounded-full p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
      <Avatar className="w-10 h-10">
        <ImageWithFallback
          src={!hasError ? logoUrl : null}
          alt={teamName}
          className="object-contain"
          forceRefresh={refreshTrigger > 0}
          onLoad={handleImageLoad}
          onError={handleImageError}
          lazy={false}
          fallback={
            <AvatarFallback className="text-xs font-medium bg-gray-100 text-gray-700">
              {teamName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          }
        />
      </Avatar>
    </div>
  );
};

export default TeamLogo;
