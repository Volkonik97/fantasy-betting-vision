
import React from "react";
import TeamLogo from "./TeamLogo";
import { Team } from "@/utils/models/types";

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
    winner?: string;
    score?: [number, number];
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
  // Log scores for debugging
  console.log(`Match ${matchId} - Individual match scores - Blue: ${blueScore}, Red: ${redScore}`);
  console.log(`Match ${matchId} - Result:`, result);
  
  // Determine which scores to display - always use individual match scores for this component
  // If we have a result with scores, use those
  let displayBlueScore = blueScore;
  let displayRedScore = redScore;
  
  if (status === "Completed" && result && result.score) {
    displayBlueScore = result.score[0];
    displayRedScore = result.score[1];
    console.log(`Match ${matchId} - Using result scores: ${displayBlueScore}:${displayRedScore}`);
  }
  
  // Determine if blue or red team has won
  const hasBlueWon = result?.winner === teamBlue.id;
  const hasRedWon = result?.winner === teamRed.id;
  
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
            <span className={hasBlueWon ? "text-lol-blue" : "text-gray-400"}>
              {displayBlueScore}
            </span>
            <span className="text-gray-300">:</span>
            <span className={hasRedWon ? "text-lol-red" : "text-gray-400"}>
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
