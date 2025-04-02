import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { format } from "date-fns";
import { Match } from "@/utils/models/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getTeamLogoUrl } from "@/utils/database/teams/logoUtils";

interface MatchTeamsProps {
  match: Match;
  selectedTeam: string | null;
  onTeamSelect: (teamId: string) => void;
}

const MatchTeams = ({ match, selectedTeam, onTeamSelect }: MatchTeamsProps) => {
  const matchDate = new Date(match.date);
  
  const [blueLogoUrl, setBlueLogoUrl] = useState<string | null>(match.teamBlue.logo || null);
  const [redLogoUrl, setRedLogoUrl] = useState<string | null>(match.teamRed.logo || null);
  
  useEffect(() => {
    const fetchLogos = async () => {
      try {
        // Fetch blue team logo if needed
        if (!match.teamBlue.logo) {
          const blueUrl = await getTeamLogoUrl(match.teamBlue.id);
          if (blueUrl) {
            setBlueLogoUrl(blueUrl);
          }
        }
        
        // Fetch red team logo if needed
        if (!match.teamRed.logo) {
          const redUrl = await getTeamLogoUrl(match.teamRed.id);
          if (redUrl) {
            setRedLogoUrl(redUrl);
          }
        }
      } catch (error) {
        console.error("Error fetching team logos:", error);
      }
    };
    
    fetchLogos();
  }, [match.teamBlue.id, match.teamBlue.logo, match.teamRed.id, match.teamRed.logo]);
  
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
          <Avatar className="w-full h-full">
            <AvatarImage 
              src={blueLogoUrl || ''} 
              alt={match.teamBlue.name} 
              className="w-full h-full object-contain"
            />
            <AvatarFallback className="text-sm font-medium bg-gray-100 text-gray-700">
              {match.teamBlue.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
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
          <Avatar className="w-full h-full">
            <AvatarImage 
              src={redLogoUrl || ''} 
              alt={match.teamRed.name} 
              className="w-full h-full object-contain"
            />
            <AvatarFallback className="text-sm font-medium bg-gray-100 text-gray-700">
              {match.teamRed.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
};

export default MatchTeams;
