
import React, { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { formatSecondsToMinutesSeconds } from "@/utils/dataConverter";
import { getSeriesScore } from "@/utils/database/matchesService";

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
}

const CompletedMatchInfo: React.FC<CompletedMatchInfoProps> = ({ 
  result, 
  winnerName,
  matchId,
  seriesAggregation = false 
}) => {
  const [seriesInfo, setSeriesInfo] = useState<string | null>(null);
  
  useEffect(() => {
    const getSeriesInfo = async () => {
      if (seriesAggregation) {
        try {
          const baseMatchId = matchId.split('_').slice(0, -1).join('_');
          const matchCount = await getSeriesScore(baseMatchId, '', '', true);
          
          // Check if matchCount is a number before comparing
          if (typeof matchCount === 'number' && matchCount > 1) {
            setSeriesInfo(`Match ${matchCount} of the series`);
          }
        } catch (error) {
          console.error("Error getting series info:", error);
        }
      }
    };
    
    getSeriesInfo();
  }, [matchId, seriesAggregation]);
  
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
        <div className="text-xs text-gray-500 italic mt-1">
          {seriesInfo}
        </div>
      )}
    </div>
  );
};

export default CompletedMatchInfo;
