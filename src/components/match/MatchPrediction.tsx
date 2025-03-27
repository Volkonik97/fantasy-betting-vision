
import React from "react";
import { Match } from "@/utils/models/types";

interface MatchPredictionProps {
  match: Match;
}

const MatchPrediction = ({ match }: MatchPredictionProps) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">Match Prediction</h3>
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>{match.teamBlue.name}</span>
            <span>{match.teamRed.name}</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-lol-blue to-lol-red"
              style={{ width: `${match.blueWinOdds * 100}%` }}
            />
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
