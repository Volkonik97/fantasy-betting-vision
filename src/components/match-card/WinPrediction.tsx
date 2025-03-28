
import React from "react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface WinPredictionProps {
  blueWinOdds: number;
  redWinOdds: number;
  predictedWinner: string;
  teamBlueId: string;
  teamRedId: string;
  matchId: string;
  showDetails?: boolean;
}

const WinPrediction: React.FC<WinPredictionProps> = ({
  blueWinOdds,
  redWinOdds,
  predictedWinner,
  teamBlueId,
  teamRedId,
  matchId,
  showDetails = true
}) => {
  return (
    <div className="flex justify-between items-center">
      <div className="w-full">
        <span className="text-xs text-gray-500 block mb-1">Win Prediction</span>
        <div className="flex items-center gap-0">
          <div 
            className={cn(
              "h-2 rounded-l-full",
              predictedWinner === teamBlueId ? "bg-lol-blue" : "bg-blue-200"
            )}
            style={{ width: `${blueWinOdds * 100}%` }}
          />
          <div 
            className={cn(
              "h-2 rounded-r-full",
              predictedWinner === teamRedId ? "bg-lol-red" : "bg-red-200"
            )}
            style={{ width: `${redWinOdds * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs font-medium">{(blueWinOdds * 100).toFixed(0)}%</span>
          <span className="text-xs font-medium">{(redWinOdds * 100).toFixed(0)}%</span>
        </div>
      </div>
      
      {showDetails && (
        <Link 
          to={`/matches/${matchId}`} 
          className="flex-shrink-0 ml-4 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-md transition-colors duration-200"
        >
          Details
        </Link>
      )}
    </div>
  );
};

export default WinPrediction;
