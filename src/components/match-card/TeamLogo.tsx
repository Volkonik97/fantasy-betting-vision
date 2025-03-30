
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface TeamLogoProps {
  logoUrl: string | null;
  teamName: string;
  onError: () => void;
  hasError: boolean;
}

const TeamLogo: React.FC<TeamLogoProps> = ({ logoUrl, teamName, onError, hasError }) => {
  return (
    <div className="w-12 h-12 bg-gray-50 rounded-full p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
      {!hasError && logoUrl ? (
        <Avatar className="w-10 h-10">
          <AvatarImage 
            src={logoUrl} 
            alt={teamName} 
            className="object-contain"
            onError={onError}
          />
          <AvatarFallback className="text-xs font-medium bg-gray-100 text-gray-700">
            {teamName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ) : (
        <Avatar className="w-10 h-10">
          <AvatarFallback className="text-xs font-medium bg-gray-100 text-gray-700">
            {teamName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default TeamLogo;
