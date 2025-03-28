
import React, { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { formatSecondsToMinutesSeconds } from "@/utils/dataConverter";
import { 
  getSeriesScore, 
  getGameNumberFromId, 
  getBaseMatchId, 
  getSeriesScoreUpToGame 
} from "@/utils/database/matchesService";

interface CompletedMatchInfoProps {
  result: {
    winner: string;
    score: [number, number];
    duration?: string;
    mvp?: string;
  };
  winnerName: string;
  matchId: string;
  seriesAggregation?: boolean;
  teamBlueId?: string;
  teamRedId?: string;
}

const CompletedMatchInfo: React.FC<CompletedMatchInfoProps> = ({ 
  result, 
  winnerName,
  matchId,
  seriesAggregation = false,
  teamBlueId,
  teamRedId 
}) => {
  const [seriesInfo, setSeriesInfo] = useState<string | null>(null);
  const [seriesScore, setSeriesScore] = useState<{blue: number, red: number} | null>(null);
  
  useEffect(() => {
    const getSeriesInfo = async () => {
      if (seriesAggregation) {
        try {
          // Get the base match ID (without game number)
          const baseMatchId = getBaseMatchId(matchId);
          
          // Get the game number
          const gameNumber = getGameNumberFromId(matchId);
          console.log(`Game number for match ${matchId} is ${gameNumber}`);
          
          // Get the series length
          const seriesResult = await getSeriesScore(baseMatchId, '', '', true);
          console.log(`Series length for ${baseMatchId} is ${seriesResult}`);
          
          // Check if the series length is valid and reasonable (max Bo7)
          if (typeof seriesResult === 'number' && seriesResult > 1 && seriesResult <= 7) {
            // Get the score up to this current game (not including this game's result)
            if (gameNumber > 1 && teamBlueId && teamRedId) {
              const previousScore = await getSeriesScoreUpToGame(
                baseMatchId, 
                gameNumber, 
                teamBlueId, 
                teamRedId
              );
              
              console.log(`Previous score before game ${gameNumber}: Blue ${previousScore.blue} - Red ${previousScore.red}`);
              setSeriesScore(previousScore);
            }
            
            setSeriesInfo(`Game ${gameNumber} of ${seriesResult} in the series`);
          } else {
            // If the series length is invalid, just show the game number
            setSeriesInfo(`Game ${gameNumber}`);
          }
        } catch (error) {
          console.error("Error getting series info:", error);
        }
      }
    };
    
    getSeriesInfo();
  }, [matchId, seriesAggregation, teamBlueId, teamRedId]);
  
  const formattedDuration = result.duration ? formatSecondsToMinutesSeconds(parseInt(result.duration)) : "??:??";
  
  return (
    <div className="mt-4 grid grid-cols-1 gap-2">
      <div className="text-sm text-gray-600">
        <span className="font-medium">{winnerName}</span> won in {formattedDuration}
      </div>
      {result.mvp && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4 text-gray-400" />
          <span>MVP: {result.mvp}</span>
        </div>
      )}
      {seriesInfo && (
        <div className="text-xs text-gray-500 mt-1">
          {seriesInfo}
          {seriesScore && (
            <span className="ml-2">
              (Series: 
              <span className={seriesScore.blue > seriesScore.red ? "text-green-600" : "text-gray-600"}> {seriesScore.blue}</span>
              -
              <span className={seriesScore.red > seriesScore.blue ? "text-green-600" : "text-gray-600"}> {seriesScore.red}</span>)
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default CompletedMatchInfo;
