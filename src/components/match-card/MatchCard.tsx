
import React, { useState, useEffect } from "react";
import { isPast, isFuture } from "date-fns";
import { Match } from "@/utils/models/types";
import { cn } from "@/lib/utils";
import { getTeamLogoUrl } from "@/utils/database/teams/logoUtils";
import { isSeriesMatch, isStandardSeries } from "@/utils/database/matchesService";

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
  const [isSeries, setIsSeries] = useState(false);
  
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
    
    // Check if this is a series match and verify it's a valid series
    const checkIfSeries = async () => {
      const isMatchInSeries = isSeriesMatch(match.id);
      
      if (isMatchInSeries) {
        try {
          // Fix: Convert string to array for input arguments expecting string[]
          const validSeries = await isStandardSeries([match.id]);
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
    
    fetchLogos();
    checkIfSeries();
  }, [match.teamBlue.id, match.teamBlue.logo, match.teamRed.id, match.teamRed.logo, match.id]);
  
  // Log for debugging
  console.log(`Match ${match.id} - Is series: ${isSeries}`);
  
  // Ensure scores are properly extracted and treated as numbers
  const blueScore = match.result?.score && match.result.score.length > 0 
    ? (typeof match.result.score[0] === 'number' ? match.result.score[0] : parseInt(String(match.result.score[0])) || 0) 
    : 0;
    
  const redScore = match.result?.score && match.result.score.length > 1 
    ? (typeof match.result.score[1] === 'number' ? match.result.score[1] : parseInt(String(match.result.score[1])) || 0) 
    : 0;
  
  // Create a properly typed score array
  const scoreArray: [number, number] = [blueScore, redScore];
    
  // Debug the scores
  console.log(`Match ${match.id} - Score: ${blueScore}:${redScore}`, match.result?.score);
  
  // Determine winner name and ensure it exists
  const winnerName = match.result?.winner 
    ? (match.result.winner === match.teamBlue.id ? match.teamBlue.name : match.teamRed.name)
    : 'Unknown';
  
  // Create a properly typed match result for CompletedMatchInfo
  const safeResult = match.result ? {
    winner: match.result.winner || match.teamBlue.id, // Default to blue team if no winner
    score: scoreArray,
    duration: match.result.duration || "0",
    mvp: match.result.mvp
  } : undefined;
  
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
        
        {match.status === "Completed" && safeResult && winnerName && (
          <CompletedMatchInfo 
            result={safeResult}
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
