
import React from "react";
import { Trophy, Clock, Users } from "lucide-react";
import { Match } from "@/utils/models/types";
import { formatSecondsToMinutesSeconds } from "@/utils/dataConverter";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface MatchResultsProps {
  match: Match;
}

const MatchResults = ({ match }: MatchResultsProps) => {
  if (match.status !== "Completed" || !match.result) {
    return null;
  }
  
  const winnerTeam = match.result.winner === match.teamBlue.id ? match.teamBlue : match.teamRed;
  
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">Match Results</h3>
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarImage
                  src={winnerTeam.logo}
                  alt={winnerTeam.name}
                  className="object-contain"
                />
                <AvatarFallback className="text-xs">
                  {winnerTeam.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm text-gray-500">Winner</div>
                <div className="font-medium">{winnerTeam.name}</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <div>
              <div className="text-sm text-gray-500">Match Duration</div>
              <div className="font-medium">
                {match.result?.duration ? formatSecondsToMinutesSeconds(Number(match.result.duration)) : "??:??"}
              </div>
            </div>
          </div>
          
          {match.result.mvp && (
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-sm text-gray-500">MVP</div>
                <div className="font-medium">{match.result.mvp}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchResults;
