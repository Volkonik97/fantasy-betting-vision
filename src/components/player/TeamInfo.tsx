
import React from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
  const content = (
    <div className="flex items-center gap-2 mt-0.5 hover:opacity-80 transition-opacity">
      {showTeamLogo && (
        <Avatar className="h-5 w-5">
          <AvatarFallback className="text-[10px] font-medium">
            {teamName?.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      <span className="text-sm text-gray-600">{teamName}</span>
    </div>
  );

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
