
import React from "react";
import { Match } from "@/utils/models/types";

interface MatchKeyFactorsProps {
  match: Match;
}

const MatchKeyFactors = ({ match }: MatchKeyFactorsProps) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">Key Factors</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Form</div>
          <div className="text-lg font-medium mb-1">
            {match.teamBlue.winRate > match.teamRed.winRate ? match.teamBlue.name : match.teamRed.name}
          </div>
          <div className="text-sm text-gray-600">
            Recent win rate: {Math.round(Math.max(match.teamBlue.winRate, match.teamRed.winRate) * 100)}%
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Side Advantage</div>
          <div className="text-lg font-medium mb-1">
            {match.teamBlue.blueWinRate > match.teamRed.redWinRate ? "Blue Side" : "Red Side"}
          </div>
          <div className="text-sm text-gray-600">
            {match.teamBlue.blueWinRate > match.teamRed.redWinRate 
              ? `${match.teamBlue.name}: ${Math.round(match.teamBlue.blueWinRate * 100)}% on blue side`
              : `${match.teamRed.name}: ${Math.round(match.teamRed.redWinRate * 100)}% on red side`
            }
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Game Time</div>
          <div className="text-lg font-medium mb-1">
            {match.teamBlue.averageGameTime < match.teamRed.averageGameTime 
              ? `${match.teamBlue.name} (Faster)` 
              : `${match.teamRed.name} (Faster)`
            }
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
