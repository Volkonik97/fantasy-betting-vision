
import React, { useState, useEffect } from "react";
import { format, isPast, isFuture } from "date-fns";
import { Match } from "@/utils/models/types";
import { cn } from "@/lib/utils";
import { Clock, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { formatSecondsToMinutesSeconds } from "@/utils/dataConverter";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getTeamLogoUrl } from "@/utils/database/teams/logoUtils";

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
  
  return (
    <div 
      className={cn(
        "bg-white border border-gray-100 rounded-xl shadow-subtle overflow-hidden transition-all duration-300 hover:shadow-md",
        className
      )}
    >
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{match.tournament}</span>
          <span className="h-1 w-1 rounded-full bg-gray-300" />
          <span className="text-sm text-gray-500">
            {format(matchDate, "MMM d, yyyy • h:mm a")}
          </span>
        </div>
        
        <div>
          {match.status === "Live" && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-lol-red text-white">
              <span className="w-2 h-2 rounded-full bg-white mr-1 animate-pulse" />
              Live
            </span>
          )}
          
          {match.status === "Upcoming" && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              Upcoming
            </span>
          )}
          
          {match.status === "Completed" && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Completed
            </span>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-50 rounded-full p-1 flex items-center justify-center overflow-hidden">
              {!blueLogoError && blueLogoUrl ? (
                <Avatar className="w-10 h-10">
                  <AvatarImage 
                    src={blueLogoUrl} 
                    alt={match.teamBlue.name} 
                    className="object-contain"
                    onError={() => setBlueLogoError(true)}
                  />
                  <AvatarFallback className="text-xs font-medium bg-gray-100 text-gray-700">
                    {match.teamBlue.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="text-xs font-medium bg-gray-100 text-gray-700">
                    {match.teamBlue.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
            <div>
              <h3 className="font-medium">{match.teamBlue.name}</h3>
              <span className="text-sm text-gray-500">{match.teamBlue.region}</span>
            </div>
          </div>
          
          <div className="text-center">
            {match.status === "Completed" && match.result ? (
              <div className="flex items-center gap-2 text-lg font-semibold">
                <span className={match.result.winner === match.teamBlue.id ? "text-lol-blue" : "text-gray-400"}>
                  {match.result.score[0]}
                </span>
                <span className="text-gray-300">:</span>
                <span className={match.result.winner === match.teamRed.id ? "text-lol-red" : "text-gray-400"}>
                  {match.result.score[1]}
                </span>
              </div>
            ) : (
              <div className="text-sm font-medium text-gray-500">VS</div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <div>
              <h3 className="font-medium text-right">{match.teamRed.name}</h3>
              <span className="text-sm text-gray-500 block text-right">{match.teamRed.region}</span>
            </div>
            <div className="w-12 h-12 bg-gray-50 rounded-full p-1 flex items-center justify-center overflow-hidden">
              {!redLogoError && redLogoUrl ? (
                <Avatar className="w-10 h-10">
                  <AvatarImage 
                    src={redLogoUrl} 
                    alt={match.teamRed.name} 
                    className="object-contain"
                    onError={() => setRedLogoError(true)}
                  />
                  <AvatarFallback className="text-xs font-medium bg-gray-100 text-gray-700">
                    {match.teamRed.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="text-xs font-medium bg-gray-100 text-gray-700">
                    {match.teamRed.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-5 pt-5 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <div className="w-full">
              <span className="text-xs text-gray-500 block mb-1">Win Prediction</span>
              <div className="flex items-center gap-0">
                <div 
                  className={cn(
                    "h-2 rounded-l-full",
                    match.predictedWinner === match.teamBlue.id ? "bg-lol-blue" : "bg-blue-200"
                  )}
                  style={{ width: `${match.blueWinOdds * 100}%` }}
                />
                <div 
                  className={cn(
                    "h-2 rounded-r-full",
                    match.predictedWinner === match.teamRed.id ? "bg-lol-red" : "bg-red-200"
                  )}
                  style={{ width: `${match.redWinOdds * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs font-medium">{(match.blueWinOdds * 100).toFixed(0)}%</span>
                <span className="text-xs font-medium">{(match.redWinOdds * 100).toFixed(0)}%</span>
              </div>
            </div>
            
            {showDetails && (
              <Link 
                to={`/matches/${match.id}`} 
                className="flex-shrink-0 ml-4 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-md transition-colors duration-200"
              >
                Details
              </Link>
            )}
          </div>
        </div>
        
        {match.status === "Upcoming" && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{format(matchDate, "h:mm a")} local time</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 justify-end">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <span>High stakes match</span>
            </div>
          </div>
        )}
        
        {match.status === "Completed" && match.result && (
          <div className="mt-4 grid grid-cols-1 gap-2">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{match.result.winner === match.teamBlue.id ? match.teamBlue.name : match.teamRed.name}</span> won in {match.result.duration ? formatSecondsToMinutesSeconds(parseInt(match.result.duration)) : "??:??"}
            </div>
            {match.result.mvp && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4 text-gray-400" />
                <span>MVP: {match.result.mvp}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchCard;
