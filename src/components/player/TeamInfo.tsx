
import React, { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getTeamLogoUrl } from "@/utils/database/teams/logoUtils";

interface TeamInfoProps {
  teamId: string;
  teamName?: string;
  region?: string;
  showTeamLogo?: boolean;
}

const TeamInfo: React.FC<TeamInfoProps> = ({ teamId, teamName, region, showTeamLogo = false }) => {
  const [teamLogo, setTeamLogo] = useState<string | null>(null);
  const [isLogoLoading, setIsLogoLoading] = useState(true);
  const [logoError, setLogoError] = useState(false);
  
  useEffect(() => {
    const fetchTeamLogo = async () => {
      if (showTeamLogo && teamId) {
        setIsLogoLoading(true);
        setLogoError(false);
        try {
          const logoUrl = await getTeamLogoUrl(teamId);
          setTeamLogo(logoUrl);
        } catch (error) {
          console.error("Error fetching team logo:", error);
          setLogoError(true);
        } finally {
          setIsLogoLoading(false);
        }
      }
    };
    
    fetchTeamLogo();
  }, [teamId, showTeamLogo]);
  
  if (!showTeamLogo) {
    return <p className="text-sm text-gray-500">{teamName || teamId}{region ? `, ${region}` : ""}</p>;
  }
  
  return (
    <div className="flex items-center gap-2">
      {isLogoLoading ? (
        <div className="w-5 h-5 bg-gray-200 rounded-full animate-pulse"></div>
      ) : (
        <Avatar className="w-5 h-5">
          {!logoError && teamLogo ? (
            <AvatarImage 
              src={teamLogo} 
              alt={`${teamName || teamId} logo`}
              className="object-contain"
              onError={() => setLogoError(true)}
            />
          ) : null}
          <AvatarFallback className="text-[8px]">
            {(teamName || teamId || "")?.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      <p className="text-sm text-gray-500">{teamName || teamId}{region ? `, ${region}` : ""}</p>
    </div>
  );
};

export default TeamInfo;
