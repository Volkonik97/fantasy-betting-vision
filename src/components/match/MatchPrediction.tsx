
import React from "react";
import { Match } from "@/utils/models/types";
import { ArrowUpRight } from "lucide-react";

interface MatchPredictionProps {
  match: Match;
}

const MatchPrediction = ({ match }: MatchPredictionProps) => {
  // Calculer le pourcentage correct pour la progression de la barre
  const blueWinPercentage = match.blueWinOdds * 100;
  const redWinPercentage = match.redWinOdds * 100;
  
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">Match Prediction</h3>
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <div className="flex items-center">
              <img 
                src={match.teamBlue.logo} 
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
                src={match.teamRed.logo} 
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
