
import React from "react";
import { Match } from "@/utils/models/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface MatchKeyFactorsProps {
  match: Match;
}

const MatchKeyFactors = ({ match }: MatchKeyFactorsProps) => {
  // Determine which team has the better win rate
  const bestFormTeam = match.teamBlue.winRate > match.teamRed.winRate ? match.teamBlue : match.teamRed;
  
  // Determine which side has the advantage
  const blueSideAdvantage = match.teamBlue.blueWinRate > match.teamRed.redWinRate;
  const sideAdvantageTeam = blueSideAdvantage ? match.teamBlue : match.teamRed;
  
  // Determine which team is faster
  const fasterTeam = match.teamBlue.averageGameTime < match.teamRed.averageGameTime ? match.teamBlue : match.teamRed;
  
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">Key Factors</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Form</div>
          <div className="flex items-center gap-2 mb-1">
            <Avatar className="w-6 h-6">
              <AvatarImage
                src={bestFormTeam.logo}
                alt={bestFormTeam.name}
                className="object-contain"
              />
              <AvatarFallback className="text-xs">
                {bestFormTeam.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-lg font-medium">{bestFormTeam.name}</span>
          </div>
          <div className="text-sm text-gray-600">
            Recent win rate: {Math.round(Math.max(match.teamBlue.winRate, match.teamRed.winRate) * 100)}%
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Side Advantage</div>
          <div className="flex items-center gap-2 mb-1">
            <Avatar className="w-6 h-6">
              <AvatarImage
                src={sideAdvantageTeam.logo}
                alt={sideAdvantageTeam.name}
                className="object-contain"
              />
              <AvatarFallback className="text-xs">
                {sideAdvantageTeam.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-lg font-medium">
              {blueSideAdvantage ? "Blue Side" : "Red Side"}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            {sideAdvantageTeam.name}: {Math.round(blueSideAdvantage ? sideAdvantageTeam.blueWinRate * 100 : sideAdvantageTeam.redWinRate * 100)}% win rate
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Game Time</div>
          <div className="flex items-center gap-2 mb-1">
            <Avatar className="w-6 h-6">
              <AvatarImage
                src={fasterTeam.logo}
                alt={fasterTeam.name}
                className="object-contain"
              />
              <AvatarFallback className="text-xs">
                {fasterTeam.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-lg font-medium">
              {fasterTeam.name} (Faster)
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Avg: {Math.min(match.teamBlue.averageGameTime, match.teamRed.averageGameTime).toFixed(1)} min
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchKeyFactors;
