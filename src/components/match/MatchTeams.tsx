
import React from "react";
import { Clock } from "lucide-react";
import { format } from "date-fns";
import { Match } from "@/utils/models/types";

interface MatchTeamsProps {
  match: Match;
  selectedTeam: string | null;
  onTeamSelect: (teamId: string) => void;
}

const MatchTeams = ({ match, selectedTeam, onTeamSelect }: MatchTeamsProps) => {
  const matchDate = new Date(match.date);
  
  return (
    <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
      <div className="flex items-center gap-6">
        <div 
          className={`w-20 h-20 rounded-full p-2 cursor-pointer transition-all ${
            selectedTeam === match.teamBlue.id 
              ? "bg-lol-blue bg-opacity-20 scale-110" 
              : "bg-gray-50 hover:bg-gray-100"
          }`}
          onClick={() => onTeamSelect(match.teamBlue.id)}
        >
          <img 
            src={match.teamBlue.logo} 
            alt={match.teamBlue.name} 
            className="w-full h-full object-contain"
          />
        </div>
        
        <div className="text-center">
          <h2 className="text-xl font-bold">{match.teamBlue.name}</h2>
          <span className="text-sm text-gray-500">{match.teamBlue.region}</span>
          <div className="mt-1 text-sm font-medium text-lol-blue">
            {(match.blueWinOdds * 100).toFixed(0)}% Win Chance
          </div>
        </div>
      </div>
      
      <div className="flex flex-col items-center">
        <div className="text-2xl font-bold text-gray-700 mb-2">VS</div>
        {match.status === "Completed" && match.result && (
          <div className="flex items-center gap-3 text-xl font-bold">
            <span className={match.result.winner === match.teamBlue.id ? "text-lol-blue" : "text-gray-400"}>
              {match.result.score[0]}
            </span>
            <span className="text-gray-300">-</span>
            <span className={match.result.winner === match.teamRed.id ? "text-lol-red" : "text-gray-400"}>
              {match.result.score[1]}
            </span>
          </div>
        )}
        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{format(matchDate, "h:mm a")}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="text-center">
          <h2 className="text-xl font-bold">{match.teamRed.name}</h2>
          <span className="text-sm text-gray-500">{match.teamRed.region}</span>
          <div className="mt-1 text-sm font-medium text-lol-red">
            {(match.redWinOdds * 100).toFixed(0)}% Win Chance
          </div>
        </div>
        
        <div 
          className={`w-20 h-20 rounded-full p-2 cursor-pointer transition-all ${
            selectedTeam === match.teamRed.id 
              ? "bg-lol-red bg-opacity-20 scale-110" 
              : "bg-gray-50 hover:bg-gray-100"
          }`}
          onClick={() => onTeamSelect(match.teamRed.id)}
        >
          <img 
            src={match.teamRed.logo} 
            alt={match.teamRed.name} 
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default MatchTeams;
