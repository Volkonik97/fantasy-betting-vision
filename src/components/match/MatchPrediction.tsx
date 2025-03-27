
import React, { useEffect } from "react";
import { Match } from "@/utils/models/types";
import { ArrowUpRight } from "lucide-react";

interface MatchPredictionProps {
  match: Match;
}

const MatchPrediction = ({ match }: MatchPredictionProps) => {
  // Ensure valid percentage values with better validation
  const blueWinPercentage = isNaN(match.blueWinOdds) ? 50 : Math.max(0, Math.min(100, match.blueWinOdds * 100));
  const redWinPercentage = isNaN(match.redWinOdds) ? 50 : Math.max(0, Math.min(100, match.redWinOdds * 100));
  
  // Debug logging
  useEffect(() => {
    console.log("MatchPrediction data:", {
      blueTeam: match.teamBlue.name,
      redTeam: match.teamRed.name,
      blueWinOdds: match.blueWinOdds,
      redWinOdds: match.redWinOdds,
      blueWinPercentage,
      redWinPercentage,
      predictedWinner: match.predictedWinner
    });
  }, [match]);
  
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">Match Prediction</h3>
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <div className="flex items-center">
              <img 
                src={match.teamBlue.logo || "/placeholder.svg"} 
                alt={match.teamBlue.name}
                className="w-5 h-5 mr-2 object-contain" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }}
              />
              <span>{match.teamBlue.name}</span>
              {match.predictedWinner === match.teamBlue.id && (
                <ArrowUpRight className="w-4 h-4 text-green-500 ml-1" />
              )}
            </div>
            <div className="flex items-center">
              <span>{match.teamRed.name}</span>
              {match.predictedWinner === match.teamRed.id && (
                <ArrowUpRight className="w-4 h-4 text-green-500 ml-1" />
              )}
              <img 
                src={match.teamRed.logo || "/placeholder.svg"} 
                alt={match.teamRed.name}
                className="w-5 h-5 ml-2 object-contain" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }}
              />
            </div>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-lol-blue to-lol-red"
              style={{ width: `${blueWinPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{Math.round(blueWinPercentage)}%</span>
            <span>{Math.round(redWinPercentage)}%</span>
          </div>
        </div>
        
        <div className="text-sm text-gray-700">
          <p>
            <strong>{match.predictedWinner === match.teamBlue.id ? match.teamBlue.name : match.teamRed.name}</strong> is 
            predicted to win with a {Math.round(Math.max(match.blueWinOdds, match.redWinOdds) * 100)}% chance based on 
            recent performance and head-to-head statistics.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MatchPrediction;
