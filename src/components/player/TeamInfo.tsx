
import React, { useState, useEffect, useRef } from "react";
import { User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getTeamLogoUrl } from "@/utils/database/teams/logoUtils";

interface TeamInfoProps {
  teamId?: string;
  teamName?: string;
  showTeamLogo?: boolean;
}

const TeamInfo: React.FC<TeamInfoProps> = ({ teamId, teamName, showTeamLogo = false }) => {
  const [teamLogo, setTeamLogo] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchLogo = async () => {
      if (!teamId || !showTeamLogo) return;
      
      try {
        const logo = await getTeamLogoUrl(teamId);
        if (isMounted.current) {
          setTeamLogo(logo);
        }
      } catch (err) {
        console.error("Error loading team logo:", err);
        if (isMounted.current) {
          setError(true);
        }
      }
    };

    if (showTeamLogo && teamId) {
      fetchLogo();
    }
  }, [teamId, showTeamLogo]);

  if (!teamName && !teamId) {
    return (
      <div className="flex items-center text-gray-500 text-sm gap-1.5 mt-1">
        <User size={14} />
        <span>Équipe inconnue</span>
      </div>
    );
  }

  return (
    <div className="flex items-center text-gray-600 text-sm gap-1.5 mt-1">
      {showTeamLogo && !error && teamLogo ? (
        <Avatar className="h-4 w-4">
          <AvatarImage src={teamLogo} alt={teamName || "Team logo"} />
          <AvatarFallback className="text-[10px]">{(teamName || "T").substring(0, 1)}</AvatarFallback>
        </Avatar>
      ) : null}
      <span>{teamName || teamId || "Équipe inconnue"}</span>
    </div>
  );
};

export default TeamInfo;
