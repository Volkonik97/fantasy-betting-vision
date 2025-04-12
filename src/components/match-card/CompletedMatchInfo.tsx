
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock, Trophy, TrendingUp } from "lucide-react";
import { formatSecondsToMinutesSeconds } from "@/utils/dataConverter";
import { getSeriesScore } from "@/utils/database/matches/series";

interface CompletedMatchInfoProps {
  result: {
    winner: string;
    score: [number, number] | number[];
    duration: number | string;
    mvp?: string;
  };
  winnerName: string;
  matchId: string;
  seriesAggregation?: boolean;
  teamBlueId: string;
  teamRedId: string;
}

const CompletedMatchInfo = ({ 
  result, 
  winnerName, 
  matchId,
  seriesAggregation = false,
  teamBlueId,
  teamRedId
}: CompletedMatchInfoProps) => {
  const [seriesScore, setSeriesScore] = useState<{ blue: number; red: number }>({ blue: 0, red: 0 });
  const [formattedDuration, setFormattedDuration] = useState("");
  
  useEffect(() => {
    // Format the match duration
    const durationInSeconds = typeof result.duration === 'string' 
      ? parseInt(result.duration) 
      : result.duration;
      
    setFormattedDuration(formatSecondsToMinutesSeconds(durationInSeconds));
    
    // Calculate series score if needed
    const fetchSeriesScore = async () => {
      if (seriesAggregation && matchId) {
        try {
          // Ensure scores are properly formatted
          const score = await getSeriesScore(matchId);
          
          if (score) {
            // Convert array score to object format
            if (Array.isArray(score)) {
              setSeriesScore({ 
                blue: score[0],
                red: score[1]
              });
            } else {
              setSeriesScore(score);
            }
          }
        } catch (error) {
          console.error("Error fetching series score:", error);
        }
      }
    };
    
    fetchSeriesScore();
  }, [matchId, result.duration, seriesAggregation]);

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <div className="flex items-center text-sm mb-2">
        <Trophy className="w-4 h-4 text-amber-500 mr-2" />
        <span className="text-gray-700">
          {winnerName} a remporté cette rencontre
        </span>
      </div>
      
      {/* Score information with conditional display for series */}
      <div className="flex items-center text-sm mb-2">
        <TrendingUp className="w-4 h-4 text-blue-500 mr-2" />
        <span className="text-gray-700">
          {seriesAggregation ? (
            `Score de la série: ${seriesScore.blue}-${seriesScore.red}`
          ) : (
            `Score: ${result.score[0]}-${result.score[1]}`
          )}
        </span>
      </div>
      
      {/* Duration information */}
      <div className="flex items-center text-sm">
        <Clock className="w-4 h-4 text-green-500 mr-2" />
        <span className="text-gray-700">Durée: {formattedDuration}</span>
      </div>
      
      {/* MVP information if available */}
      {result.mvp && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <Link to={`/players/${result.mvp}`} className="text-sm text-blue-600 hover:underline">
            MVP: {result.mvp}
          </Link>
        </div>
      )}
    </div>
  );
};

export default CompletedMatchInfo;
