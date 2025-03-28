
import React, { useState, useEffect } from "react";
import { isPast, isFuture } from "date-fns";
import { Match } from "@/utils/models/types";
import { cn } from "@/lib/utils";
import { getTeamLogoUrl } from "@/utils/database/teams/logoUtils";

import MatchCardHeader from "./MatchCardHeader";
import MatchTeams from "./MatchTeams";
import WinPrediction from "./WinPrediction";
import UpcomingMatchInfo from "./UpcomingMatchInfo";
import CompletedMatchInfo from "./CompletedMatchInfo";

interface MatchCardProps {
  match: Match;
  className?: string;
  showDetails?: boolean;
}

const MatchCard = ({ match, className, showDetails = true }: MatchCardProps) => {
  const matchDate = new Date(match.date);
  const isPastMatch = isPast(matchDate);
  const isUpcoming = isFuture(matchDate);
  
  const [blueLogoUrl, setBlueLogoUrl] = useState<string | null>(match.teamBlue.logo || null);
  const [redLogoUrl, setRedLogoUrl] = useState<string | null>(match.teamRed.logo || null);
  const [blueLogoError, setBlueLogoError] = useState(false);
  const [redLogoError, setRedLogoError] = useState(false);
  
  useEffect(() => {
    const fetchLogos = async () => {
      try {
        // Fetch blue team logo if needed
        if (!match.teamBlue.logo || match.teamBlue.logo.includes("undefined")) {
          const blueUrl = await getTeamLogoUrl(match.teamBlue.id);
          if (blueUrl && !blueUrl.includes("undefined")) {
            setBlueLogoUrl(blueUrl);
          } else {
            setBlueLogoError(true);
          }
        }
        
        // Fetch red team logo if needed
        if (!match.teamRed.logo || match.teamRed.logo.includes("undefined")) {
          const redUrl = await getTeamLogoUrl(match.teamRed.id);
          if (redUrl && !redUrl.includes("undefined")) {
            setRedLogoUrl(redUrl);
          } else {
            setRedLogoError(true);
          }
        }
      } catch (error) {
        console.error("Error fetching team logos:", error);
      }
    };
    
    fetchLogos();
  }, [match.teamBlue.id, match.teamBlue.logo, match.teamRed.id, match.teamRed.logo]);
  
  // Fixed: Ensure scores are properly extracted and treated as numbers
  const blueScore = match.result?.score && match.result.score.length > 0 
    ? (typeof match.result.score[0] === 'number' ? match.result.score[0] : parseInt(String(match.result.score[0])) || 0) 
    : 0;
    
  const redScore = match.result?.score && match.result.score.length > 1 
    ? (typeof match.result.score[1] === 'number' ? match.result.score[1] : parseInt(String(match.result.score[1])) || 0) 
    : 0;

  // Determine if we should check for series aggregate score
  // This is for matches that have the same teams playing multiple games on the same date
  const isSeries = match.id.includes('_') && match.status === "Completed";
  
  // Log match details for debugging
  console.log(`Match ${match.id} - Score: ${blueScore}:${redScore}`, { 
    rawScore: match.result?.score,
    blueScore,
    redScore,
    winner: match.result?.winner,
    blueId: match.teamBlue.id,
    redId: match.teamRed.id,
    isSeries
  });
  
  return (
    <div 
      className={cn(
        "bg-white border border-gray-100 rounded-xl shadow-subtle overflow-hidden transition-all duration-300 hover:shadow-md h-full flex flex-col",
        className
      )}
    >
      <MatchCardHeader 
        tournament={match.tournament}
        matchDate={matchDate}
        status={match.status}
      />
      
      <div className="p-4 flex-1 flex flex-col">
        <MatchTeams 
          teamBlue={match.teamBlue}
          teamRed={match.teamRed}
          blueLogoUrl={blueLogoUrl}
          redLogoUrl={redLogoUrl}
          blueLogoError={blueLogoError}
          redLogoError={redLogoError}
          onBlueLogoError={() => setBlueLogoError(true)}
          onRedLogoError={() => setRedLogoError(true)}
          status={match.status}
          result={match.result}
          blueScore={blueScore}
          redScore={redScore}
          matchId={match.id}
          seriesAggregation={isSeries}
        />
        
        <div className="mt-5 pt-5 border-t border-gray-100">
          <WinPrediction 
            blueWinOdds={match.blueWinOdds}
            redWinOdds={match.redWinOdds}
            predictedWinner={match.predictedWinner}
            teamBlueId={match.teamBlue.id}
            teamRedId={match.teamRed.id}
            matchId={match.id}
            showDetails={showDetails}
          />
        </div>
        
        {match.status === "Upcoming" && (
          <UpcomingMatchInfo matchDate={matchDate} />
        )}
        
        {match.status === "Completed" && match.result && (
          <CompletedMatchInfo 
            result={match.result}
            winnerName={match.result.winner === match.teamBlue.id ? match.teamBlue.name : match.teamRed.name}
            matchId={match.id}
            seriesAggregation={isSeries}
          />
        )}
      </div>
    </div>
  );
};

export default MatchCard;
