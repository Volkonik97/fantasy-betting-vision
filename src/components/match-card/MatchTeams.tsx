
import React, { useState, useEffect } from "react";
import TeamLogo from "./TeamLogo";
import { Team } from "@/utils/models/types";
import { getSeriesScore } from "@/utils/database/matches/seriesService";

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
  
  useEffect(() => {
    // If this is part of a series, get the aggregated scores
    const fetchSeriesScores = async () => {
      if (seriesAggregation && status === "Completed") {
        try {
          // Extract the base part of the match ID (before the last underscore)
          const baseMatchId = matchId.split('_').slice(0, -1).join('_');
          
          // Get scores from all matches in this series
          const scores = await getSeriesScore(baseMatchId, teamBlue.id, teamRed.id);
          
          if (scores) {
            setAggregatedScores(scores);
            console.log(`Series scores for ${baseMatchId}:`, scores);
          }
        } catch (error) {
          console.error("Error fetching series scores:", error);
        }
      }
    };
    
    fetchSeriesScores();
  }, [matchId, teamBlue.id, teamRed.id, seriesAggregation, status]);
  
  // Use aggregated scores if available, otherwise use individual match scores
  const displayBlueScore = aggregatedScores ? aggregatedScores.blue : blueScore;
  const displayRedScore = aggregatedScores ? aggregatedScores.red : redScore;
  
  // Debug the actual score values
  console.log(`MatchTeams - Match ${matchId} - ${teamBlue.name} vs ${teamRed.name} scores:`, { 
    blueScore, 
    redScore,
    displayBlueScore,
    displayRedScore,
    aggregatedScores,
    result 
  });
  
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
