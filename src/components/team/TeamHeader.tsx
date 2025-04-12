
import React, { useEffect, useState } from "react";
import { Team } from "@/utils/models/types";
import { TrendingUp, Percent, Clock } from "lucide-react";
import { formatTime } from "@/utils/formatters/timeFormatter";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getTeamLogoUrl } from "@/utils/database/teams/logoUtils";

interface TeamHeaderProps {
  team: Team;
}

const TeamHeader = ({ team }: TeamHeaderProps) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(team?.logo || null);
  const [logoLoading, setLogoLoading] = useState(true);
  const [logoError, setLogoError] = useState(false);
  
  // Ensure win rates are properly formatted
  const winRate = typeof team.winRate === 'number' ? team.winRate : 0;
  const blueWinRate = typeof team.blueWinRate === 'number' ? team.blueWinRate : 0;
  const redWinRate = typeof team.redWinRate === 'number' ? team.redWinRate : 0;
  
  // Log for debugging
  useEffect(() => {
    console.log('TeamHeader winrates:', {
      raw: {
        winRate: team.winRate,
        blueWinRate: team.blueWinRate,
        redWinRate: team.redWinRate
      },
      formatted: {
        winRate: (winRate * 100).toFixed(0) + '%',
        blueWinRate: (blueWinRate * 100).toFixed(0) + '%',
        redWinRate: (redWinRate * 100).toFixed(0) + '%'
      }
    });
  }, [team.winRate, team.blueWinRate, team.redWinRate, winRate, blueWinRate, redWinRate]);
  
  useEffect(() => {
    const fetchLogo = async () => {
      if (!team?.id) return;

      setLogoLoading(true);
      setLogoError(false);
      
      try {
        // First try to use the logo directly from the team object
        if (team.logo && !team.logo.includes("undefined")) {
          setLogoUrl(team.logo);
          setLogoLoading(false);
          return;
        }
        
        // If no direct logo, try to fetch from storage
        const url = await getTeamLogoUrl(team.id);
        if (url && !url.includes("undefined")) {
          console.log(`Logo found for ${team.name} in header: ${url}`);
          setLogoUrl(url);
        } else {
          // Set logo error if no valid URL found
          setLogoError(true);
        }
      } catch (error) {
        console.error(`Error fetching logo for ${team?.name}:`, error);
        setLogoError(true);
      } finally {
        setLogoLoading(false);
      }
    };
    
    fetchLogo();
  }, [team?.id, team?.logo, team?.name]);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-subtle p-6 mb-8">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
          {logoLoading ? (
            <div className="animate-pulse w-12 h-12 bg-gray-200 rounded-full"></div>
          ) : logoUrl && !logoError ? (
            <Avatar className="w-16 h-16">
              <AvatarImage
                src={logoUrl}
                alt={`${team?.name} logo`}
                className="object-contain"
                onError={() => {
                  console.log(`Error loading logo for ${team?.name} in header`);
                  setLogoError(true);
                }}
              />
              <AvatarFallback className="text-lg font-medium bg-gray-100 text-gray-700">
                {team?.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="w-16 h-16">
              <AvatarFallback className="text-lg font-medium bg-gray-100 text-gray-700">
                {team?.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
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
            <p className="text-2xl font-bold">{(winRate * 100).toFixed(0)}%</p>
            <p className="text-xs text-gray-500">Win Rate</p>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center mb-1">
              <Clock size={18} className="text-lol-blue" />
            </div>
            <p className="text-2xl font-bold">{formatTime(team.averageGameTime)}</p>
            <p className="text-xs text-gray-500">Avg. Game Time</p>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center mb-1">
              <TrendingUp size={18} className="text-lol-blue" />
            </div>
            <p className="text-2xl font-bold">{(blueWinRate * 100).toFixed(0)}%</p>
            <p className="text-xs text-gray-500">Blue Side Wins</p>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center mb-1">
              <TrendingUp size={18} className="text-lol-blue" />
            </div>
            <p className="text-2xl font-bold">{(redWinRate * 100).toFixed(0)}%</p>
            <p className="text-xs text-gray-500">Red Side Wins</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamHeader;
