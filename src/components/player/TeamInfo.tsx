
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getTeamLogoUrl } from "@/utils/database/teams/logoUtils";
import ImageWithFallback from "@/components/ui/ImageWithFallback";

interface TeamInfoProps {
  teamId: string;
  teamName?: string;
  showTeamLogo?: boolean;
}

// Map to cache team logos to reduce API calls
const teamLogoCache = new Map<string, string | null>();

const TeamInfo = ({ teamId, teamName = "Unknown Team", showTeamLogo = false }: TeamInfoProps) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(() => teamLogoCache.get(teamId) || null);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const fetchTeamLogo = async () => {
      if (!teamId) return;
      
      // Use cached logo if available
      if (teamLogoCache.has(teamId)) {
        setLogoUrl(teamLogoCache.get(teamId) || null);
        return;
      }

      try {
        const url = await getTeamLogoUrl(teamId);
        
        // Cache the logo URL, even if it's null
        teamLogoCache.set(teamId, url);
        setLogoUrl(url);
      } catch (error) {
        console.error(`Error fetching logo for team ${teamId}:`, error);
        setLogoError(true);
      }
    };

    if (showTeamLogo) {
      fetchTeamLogo();
    }
  }, [teamId, showTeamLogo]);

  const hasLogo = showTeamLogo && logoUrl && !logoError;

  return (
    <Link to={`/teams/${teamId}`} className="flex items-center gap-2 mt-0.5 hover:opacity-80 transition-opacity">
      {hasLogo ? (
        <Avatar className="h-5 w-5">
          <ImageWithFallback
            src={logoUrl}
            alt={`${teamName} logo`}
            className="object-contain"
            onError={() => setLogoError(true)}
            lazy={true}
            fallback={
              <AvatarFallback className="text-[10px] font-medium">
                {teamName?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            }
          />
        </Avatar>
      ) : showTeamLogo ? (
        <Avatar className="h-5 w-5">
          <AvatarFallback className="text-[10px] font-medium">
            {teamName?.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ) : null}
      <span className="text-sm text-gray-600">{teamName}</span>
    </Link>
  );
};

export default TeamInfo;
