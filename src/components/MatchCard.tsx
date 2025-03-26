
import React from "react";
import { format, isPast, isFuture } from "date-fns";
import { Match } from "@/utils/models/types";
import { cn } from "@/lib/utils";
import { Clock, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { formatSecondsToMinutesSeconds } from "@/utils/dataConverter";
import { SideAnalysisProps } from "@/components/SideAnalysis";

interface MatchCardProps {
  match: Match;
  className?: string;
  showDetails?: boolean;
}

const MatchCard = ({ match, className, showDetails = true }: MatchCardProps) => {
  const matchDate = new Date(match.date);
  const isPastMatch = isPast(matchDate);
  const isUpcoming = isFuture(matchDate);
  
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
              <img 
                src={match.teamBlue.logo} 
                alt={match.teamBlue.name} 
                className="w-9 h-9 object-contain"
              />
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
              <img 
                src={match.teamRed.logo} 
                alt={match.teamRed.name} 
                className="w-9 h-9 object-contain"
              />
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
