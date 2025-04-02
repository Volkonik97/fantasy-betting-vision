
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getTeamLogoUrl } from "@/utils/database/teams/logoUtils";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import { getTeamLogoFromCache, handleLogoError } from "@/utils/database/teams/images/logoCache";

interface TeamInfoProps {
  teamId: string;
  teamName?: string;
  showTeamLogo?: boolean;
  linkDisabled?: boolean;
}

const TeamInfo = ({ 
  teamId, 
  teamName = "Unknown Team", 
  showTeamLogo = false,
  linkDisabled = false 
}: TeamInfoProps) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(() => {
    // Utiliser le cache immédiatement si disponible
    const cached = teamId ? getTeamLogoFromCache(teamId) : null;
    return cached !== undefined ? cached : null;
  });
  const [logoError, setLogoError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTeamLogo = async () => {
      if (!teamId) return;
      
      // Si on a déjà un logo ou si l'erreur est définitive, ne pas réessayer
      if (logoUrl !== null || logoError) return;
      
      setIsLoading(true);
      
      try {
        const url = await getTeamLogoUrl(teamId);
        setLogoUrl(url);
        if (!url) setLogoError(true);
      } catch (error) {
        console.error(`Error fetching logo for team ${teamId}:`, error);
        setLogoError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (showTeamLogo && !logoUrl && !logoError && !isLoading) {
      fetchTeamLogo();
    }
  }, [teamId, showTeamLogo, logoUrl, logoError, isLoading]);

  const onImageError = () => {
    // Utiliser notre gestionnaire d'erreurs de logo
    const shouldRetry = handleLogoError(teamId, teamName);
    if (!shouldRetry) {
      setLogoError(true);
    } else {
      // Forcer un rechargement avec un timestamp
      const timestamp = Date.now();
      setLogoUrl(logoUrl ? `${logoUrl}${logoUrl.includes('?') ? '&' : '?'}t=${timestamp}` : null);
    }
  };

  const hasLogo = showTeamLogo && logoUrl && !logoError;
  
  const content = (
    <div className="flex items-center gap-2 mt-0.5 hover:opacity-80 transition-opacity">
      {hasLogo ? (
        <Avatar className="h-5 w-5">
          <ImageWithFallback
            src={logoUrl}
            alt={`${teamName} logo`}
            className="object-contain"
            onError={onImageError}
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
    </div>
  );

  // Fix: Don't nest Link components - conditionally render either a Link or plain div
  if (linkDisabled || !teamId) {
    return content;
  }

  return (
    <Link to={`/teams/${teamId}`}>
      {content}
    </Link>
  );
};

export default TeamInfo;
