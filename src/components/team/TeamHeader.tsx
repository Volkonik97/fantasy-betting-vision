
import React, { useEffect, useState } from "react";
import { Team } from "@/utils/models/types";
import { TrendingUp, Percent, Clock } from "lucide-react";
import { formatSecondsToMinutesSeconds } from "@/utils/dataConverter";
import { getTeamLogoUrl } from "@/utils/database/teams/logoUploader";

interface TeamHeaderProps {
  team: Team;
}

const TeamHeader = ({ team }: TeamHeaderProps) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(team?.logo || null);
  
  useEffect(() => {
    const fetchLogo = async () => {
      if (team?.id) {
        const url = await getTeamLogoUrl(team.id);
        if (url) {
          setLogoUrl(url);
        }
      }
    };
    
    fetchLogo();
  }, [team?.id]);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-subtle p-6 mb-8">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
          <img 
            src={logoUrl || "/placeholder.svg"} 
            alt={`${team?.name} logo`} 
            className="w-16 h-16 object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
              // Apply some styling to center the placeholder
              target.classList.add("p-2");
            }}
          />
        </div>
        
        <div>
          <h1 className="text-3xl font-bold mb-1">{team?.name}</h1>
          <p className="text-gray-600">{team?.region}</p>
        </div>
        
        <div className="ml-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex justify-center mb-1">
              <Percent size={18} className="text-lol-blue" />
            </div>
            <p className="text-2xl font-bold">{(team.winRate * 100).toFixed(0)}%</p>
            <p className="text-xs text-gray-500">Win Rate</p>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center mb-1">
              <Clock size={18} className="text-lol-blue" />
            </div>
            <p className="text-2xl font-bold">{formatSecondsToMinutesSeconds(team.averageGameTime)}</p>
            <p className="text-xs text-gray-500">Avg. Game Time</p>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center mb-1">
              <TrendingUp size={18} className="text-lol-blue" />
            </div>
            <p className="text-2xl font-bold">{(team.blueWinRate * 100).toFixed(0)}%</p>
            <p className="text-xs text-gray-500">Blue Side Wins</p>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center mb-1">
              <TrendingUp size={18} className="text-lol-blue" />
            </div>
            <p className="text-2xl font-bold">{(team.redWinRate * 100).toFixed(0)}%</p>
            <p className="text-xs text-gray-500">Red Side Wins</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamHeader;
