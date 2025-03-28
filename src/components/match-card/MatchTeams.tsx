
import React, { useState, useEffect } from "react";
import TeamLogo from "./TeamLogo";
import { Team } from "@/utils/models/types";
import { getSeriesScore, isSeriesMatch, getBaseMatchId, isStandardSeries } from "@/utils/database/matchesService";

interface MatchTeamsProps {
  teamBlue: Team;
  teamRed: Team;
  blueLogoUrl: string | null;
  redLogoUrl: string | null;
  blueLogoError: boolean;
  redLogoError: boolean;
  onBlueLogoError: () => void;
  onRedLogoError: () => void;
  status: string;
  result?: {
    winner: string;
    score: [number, number];
  } | undefined;
  blueScore: number;
  redScore: number;
  matchId: string;
  seriesAggregation?: boolean;
}

const MatchTeams: React.FC<MatchTeamsProps> = ({
  teamBlue,
  teamRed,
  blueLogoUrl,
  redLogoUrl,
  blueLogoError,
  redLogoError,
  onBlueLogoError,
  onRedLogoError,
  status,
  result,
  blueScore,
  redScore,
  matchId,
  seriesAggregation = false
}) => {
  // State to hold aggregated scores for series matches
  const [aggregatedScores, setAggregatedScores] = useState<{blue: number, red: number} | null>(null);
  const [isValidSeries, setIsValidSeries] = useState<boolean>(false);
  
  useEffect(() => {
    // If this is part of a series, get the aggregated scores
    const fetchSeriesScores = async () => {
      if (seriesAggregation && status === "Completed") {
        try {
          // Check if this is a standard series (Bo3, Bo5, Bo7)
          const validSeries = await isStandardSeries(matchId);
          setIsValidSeries(validSeries);
          
          if (!validSeries) {
            console.log(`Match ${matchId} is not part of a standard series`);
            return;
          }
          
          // Extract the base part of the match ID (before the last underscore)
          const baseMatchId = getBaseMatchId(matchId);
          
          // Get scores from all matches in this series
          const scores = await getSeriesScore(baseMatchId, teamBlue.id, teamRed.id);
          
          // Check if scores is an object with blue/red properties before setting state
          if (scores !== null && typeof scores === 'object' && 'blue' in scores && 'red' in scores) {
            console.log(`Setting aggregated scores for match ${matchId}:`, scores);
            setAggregatedScores(scores);
          }
        } catch (error) {
          console.error("Error fetching series scores:", error);
        }
      } else {
        // Reset aggregated scores if not in a series or not completed
        setAggregatedScores(null);
        setIsValidSeries(false);
      }
    };
    
    fetchSeriesScores();
  }, [matchId, teamBlue.id, teamRed.id, seriesAggregation, status]);

  // Log scores for debugging
  console.log(`Match ${matchId} - Original scores - Blue: ${blueScore}, Red: ${redScore}`);
  console.log(`Match ${matchId} - Result:`, result);
  console.log(`Match ${matchId} - Aggregated scores:`, aggregatedScores);
  
  // Determine which scores to display
  let displayBlueScore = blueScore;
  let displayRedScore = redScore;
  
  // If this is a completed match with result, always use those scores first
  if (status === "Completed" && result && result.score) {
    displayBlueScore = result.score[0];
    displayRedScore = result.score[1];
    console.log(`Match ${matchId} - Using result scores: ${displayBlueScore}:${displayRedScore}`);
  }
  
  // Only use aggregated scores if they're available AND this is a valid series
  if (aggregatedScores && isValidSeries && seriesAggregation) {
    displayBlueScore = aggregatedScores.blue;
    displayRedScore = aggregatedScores.red;
    console.log(`Match ${matchId} - Using series scores: ${displayBlueScore}:${displayRedScore}`);
  }
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1">
        <TeamLogo 
          logoUrl={blueLogoUrl} 
          teamName={teamBlue.name} 
          onError={onBlueLogoError}
          hasError={blueLogoError}
        />
        <div>
          <h3 className="font-medium">{teamBlue.name}</h3>
          <span className="text-sm text-gray-500">{teamBlue.region}</span>
        </div>
      </div>
      
      <div className="w-24 mx-2 flex-shrink-0 flex items-center justify-center">
        {status === "Completed" ? (
          <div className="flex items-center justify-center gap-3 text-xl font-semibold">
            <span className={result?.winner === teamBlue.id ? "text-lol-blue" : "text-gray-400"}>
              {displayBlueScore}
            </span>
            <span className="text-gray-300">:</span>
            <span className={result?.winner === teamRed.id ? "text-lol-red" : "text-gray-400"}>
              {displayRedScore}
            </span>
          </div>
        ) : (
          <div className="text-sm font-medium text-gray-500">VS</div>
        )}
      </div>
      
      <div className="flex items-center gap-3 flex-1 justify-end">
        <div className="text-right">
          <h3 className="font-medium">{teamRed.name}</h3>
          <span className="text-sm text-gray-500 block">{teamRed.region}</span>
        </div>
        <TeamLogo 
          logoUrl={redLogoUrl} 
          teamName={teamRed.name}
          onError={onRedLogoError}
          hasError={redLogoError}
        />
      </div>
    </div>
  );
};

export default MatchTeams;
