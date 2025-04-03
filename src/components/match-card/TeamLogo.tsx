
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface TeamLogoProps {
  logoUrl: string | null;
  teamName: string;
  onError: () => void;
  hasError: boolean;
}

const TeamLogo: React.FC<TeamLogoProps> = ({ logoUrl, teamName, onError, hasError }) => {
  // Extract initials for the fallback
  const initials = teamName
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Special case for Gen.G logo
  const isGenG = teamName.toLowerCase().includes('gen.g') || teamName.toLowerCase() === 'geng';
  const finalLogoUrl = isGenG && (!logoUrl || hasError) 
    ? "https://upload.wikimedia.org/wikipedia/en/2/22/Gen.G_logo.png" 
    : logoUrl;

  return (
    <div className="w-12 h-12 bg-gray-50 rounded-full p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
      <Avatar className="w-10 h-10">
        {!hasError && finalLogoUrl ? (
          <AvatarImage 
            src={finalLogoUrl} 
            alt={teamName} 
            className="object-contain"
            onError={onError}
          />
        ) : null}
        <AvatarFallback className="text-xs font-medium bg-gray-100 text-gray-700">
          {initials}
        </AvatarFallback>
      </Avatar>
    </div>
  );
};

export default TeamLogo;
