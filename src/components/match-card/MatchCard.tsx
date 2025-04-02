
import React, { useState, useEffect } from "react";
import { isPast, isFuture } from "date-fns";
import { Match } from "@/utils/models/types";
import { cn } from "@/lib/utils";

import MatchCardHeader from "./MatchCardHeader";
import MatchTeams from "./MatchTeams";
import WinPrediction from "./WinPrediction";
import UpcomingMatchInfo from "./UpcomingMatchInfo";
import CompletedMatchInfo from "./CompletedMatchInfo";
import { isSeriesMatch, isStandardSeries } from "@/utils/database/matches/matchesService";

interface MatchCardProps {
  match: Match;
  className?: string;
  showDetails?: boolean;
}

const MatchCard = ({ match, className, showDetails = true }: MatchCardProps) => {
  const matchDate = new Date(match.date);
  const isPastMatch = isPast(matchDate);
  const isUpcoming = isFuture(matchDate);
  
  const [isSeries, setIsSeries] = useState(false);
  
  useEffect(() => {
    // Check if this is a series match and verify it's a valid series
    const checkIfSeries = async () => {
      const isMatchInSeries = isSeriesMatch(match.id);
      
      if (isMatchInSeries) {
        try {
          const validSeries = await isStandardSeries(match.id);
          console.log(`Match ${match.id} is${validSeries ? '' : ' not'} a valid series`);
          
          setIsSeries(validSeries);
        } catch (error) {
          console.error("Error checking series status:", error);
          setIsSeries(false);
        }
      } else {
        setIsSeries(false);
      }
    };
    
    checkIfSeries();
  }, [match.id]);
  
  // Log for debugging
  console.log(`Match ${match.id} - Is series: ${isSeries}`);
  
  // Ensure scores are properly extracted and treated as numbers
  const blueScore = match.result?.score && match.result.score.length > 0 
    ? (typeof match.result.score[0] === 'number' ? match.result.score[0] : parseInt(String(match.result.score[0])) || 0) 
    : 0;
    
  const redScore = match.result?.score && match.result.score.length > 1 
    ? (typeof match.result.score[1] === 'number' ? match.result.score[1] : parseInt(String(match.result.score[1])) || 0) 
    : 0;
    
  console.log(`Match ${match.id} - Final score calculation: Blue ${blueScore}, Red ${redScore}`);

  // Determine winner name
  const winnerName = match.result?.winner 
    ? (match.result.winner === match.teamBlue.id ? match.teamBlue.name : match.teamRed.name)
    : '';
  
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
          blueLogoUrl={match.teamBlue.logo}
          redLogoUrl={match.teamRed.logo}
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
        
        {match.status === "Completed" && match.result && winnerName && (
          <CompletedMatchInfo 
            result={match.result}
            winnerName={winnerName}
            matchId={match.id}
            seriesAggregation={isSeries}
            teamBlueId={match.teamBlue.id}
            teamRedId={match.teamRed.id}
          />
        )}
      </div>
    </div>
  );
};

export default MatchCard;
