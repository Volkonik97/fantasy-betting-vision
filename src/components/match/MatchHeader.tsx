
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Match } from "@/utils/models/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface MatchHeaderProps {
  matchDate: Date;
  tournament: string;
  match?: Match;
}

const MatchHeader = ({ matchDate, tournament, match }: MatchHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="mb-8">
      <button 
        onClick={() => navigate('/matches')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        <span>Back to Matches</span>
      </button>
      
      <div className="flex items-center gap-4 mb-2">
        <h1 className="text-3xl font-bold">Match Details</h1>
        
        {match && (
          <div className="flex items-center gap-2">
            {match.teamBlue && (
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={match.teamBlue.logo}
                  alt={match.teamBlue.name}
                  className="object-contain"
                />
                <AvatarFallback className="text-xs">
                  {match.teamBlue.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
            <span className="text-gray-500">vs</span>
            {match.teamRed && (
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={match.teamRed.logo}
                  alt={match.teamRed.name}
                  className="object-contain"
                />
                <AvatarFallback className="text-xs">
                  {match.teamRed.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2 text-gray-600">
        <Calendar className="w-4 h-4" />
        <span>{format(matchDate, "MMMM d, yyyy")} • {tournament}</span>
      </div>
    </div>
  );
};

export default MatchHeader;
