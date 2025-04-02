
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface TeamLogoProps {
  logoUrl: string | null;
  teamName: string;
}

const TeamLogo: React.FC<TeamLogoProps> = ({ logoUrl, teamName }) => {
  return (
    <div className="w-12 h-12 bg-gray-50 rounded-full p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
      <Avatar className="w-10 h-10">
        {logoUrl ? (
          <AvatarImage
            src={logoUrl}
            alt={teamName}
          />
        ) : (
          <AvatarFallback className="text-xs font-medium bg-gray-100 text-gray-700">
            {teamName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        )}
      </Avatar>
    </div>
  );
};

export default TeamLogo;
