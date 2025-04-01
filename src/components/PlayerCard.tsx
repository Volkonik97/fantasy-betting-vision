
import React, { useState, useEffect } from "react";
import { Player } from "@/utils/models/types";
import { getTeamLogoUrl } from "@/utils/database/teams/logoUtils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface PlayerCardProps {
  player: Player & { teamName?: string; teamRegion?: string };
  showTeamLogo?: boolean;
}

const PlayerCard = ({ player, showTeamLogo = false }: PlayerCardProps) => {
  const [teamLogo, setTeamLogo] = useState<string | null>(null);
  const [isLogoLoading, setIsLogoLoading] = useState(true);
  const [logoError, setLogoError] = useState(false);
  
  useEffect(() => {
    const fetchTeamLogo = async () => {
      if (showTeamLogo && player.team) {
        setIsLogoLoading(true);
        setLogoError(false);
        try {
          const logoUrl = await getTeamLogoUrl(player.team);
          if (logoUrl) {
            setTeamLogo(logoUrl);
          } else {
            setLogoError(true);
          }
        } catch (error) {
          console.error("Error fetching team logo:", error);
          setLogoError(true);
        } finally {
          setIsLogoLoading(false);
        }
      }
    };
    
    fetchTeamLogo();
  }, [player.team, showTeamLogo]);
  
  const getRoleColor = (role: string) => {
    switch (role) {
      case "Top": return "bg-yellow-500";
      case "Jungle": return "bg-green-500";
      case "Mid": return "bg-blue-500";
      case "ADC": return "bg-red-500";
      case "Support": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const getRoleDisplayName = (role: string): string => {
    switch (role) {
      case "Top": return "Top";
      case "Jungle": return "Jng";
      case "Mid": return "Mid";
      case "ADC": return "Bot";
      case "Support": return "Sup";
      default: return role;
    }
  };

  return (
    <div className="group h-full bg-white rounded-lg shadow-subtle hover:shadow-md transition-all border border-gray-100 overflow-hidden">
      <div className="h-48 bg-gray-50 relative">
        {player.image ? (
          <img
            src={player.image}
            alt={player.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null; // Prevent infinite error loop
              target.src = "/placeholder.svg";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-5xl font-bold text-gray-300">{player.name.charAt(0)}</span>
          </div>
        )}
        <div className={`absolute bottom-0 left-0 right-0 h-8 ${getRoleColor(player.role)} flex items-center justify-center`}>
          <span className="text-white font-medium">{getRoleDisplayName(player.role)}</span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex flex-col">
          <h3 className="font-bold text-lg mb-1 text-gray-900">{player.name}</h3>
          <div className="flex items-center gap-2">
            {showTeamLogo && (
              isLogoLoading ? (
                <div className="w-5 h-5 bg-gray-200 rounded-full animate-pulse"></div>
              ) : !logoError && teamLogo ? (
                <Avatar className="w-5 h-5">
                  <AvatarImage 
                    src={teamLogo} 
                    alt={`${player.teamName || player.team} logo`}
                    className="object-contain"
                    onError={() => {
                      setLogoError(true);
                    }}
                  />
                  <AvatarFallback className="text-[8px]">
                    {(player.teamName || player.team || "")?.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className="w-5 h-5">
                  <AvatarFallback className="text-[8px]">
                    {(player.teamName || player.team || "")?.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
              )
            )}
            <p className="text-sm text-gray-500">{player.teamName || player.team}</p>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="font-semibold">{typeof player.kda === 'number' ? player.kda.toFixed(1) : player.kda}</p>
            <p className="text-xs text-gray-500">KDA</p>
          </div>
          <div>
            <p className="font-semibold">{typeof player.csPerMin === 'number' ? player.csPerMin.toFixed(1) : player.csPerMin}</p>
            <p className="text-xs text-gray-500">CS/min</p>
          </div>
          <div>
            <p className="font-semibold">{typeof player.damageShare === 'number' ? `${Math.round(player.damageShare * 100)}%` : player.damageShare}</p>
            <p className="text-xs text-gray-500">DMG%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
