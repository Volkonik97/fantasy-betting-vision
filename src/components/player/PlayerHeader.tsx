import React, { useState, useEffect } from "react";
import { Player } from "@/utils/models/types";
import { Activity, Trophy, Award, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { getTeamLogoUrl } from "@/utils/database/teams/logoUtils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getRoleColor, getRoleDisplayName, normalizeRoleName } from "./RoleBadge";

interface PlayerHeaderProps {
  player: Player;
  teamName: string;
  kdaOverride?: number | null;
  cspmOverride?: number | null;
  damageShareOverride?: number | null;
}

const PlayerHeader = ({ 
  player, 
  teamName, 
  kdaOverride = null, 
  cspmOverride = null, 
  damageShareOverride = null 
}: PlayerHeaderProps) => {
  const [teamLogo, setTeamLogo] = useState<string | null>(null);
  const [isLogoLoading, setIsLogoLoading] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchTeamLogo = async () => {
      if (!player.team) return;
      
      setIsLogoLoading(true);
      setLogoError(false);
      try {
        const logoUrl = await getTeamLogoUrl(player.team);
        if (isMounted) {
          setTeamLogo(logoUrl);
        }
      } catch (error) {
        console.error("Error fetching team logo:", error);
        if (isMounted) {
          setLogoError(true);
        }
      } finally {
        if (isMounted) {
          setIsLogoLoading(false);
        }
      }
    };

    fetchTeamLogo();
    
    return () => {
      isMounted = false;
    };
  }, [player.team]);
  
  const playerKda = kdaOverride !== null ? kdaOverride : 
    (typeof player.kda === 'number' ? player.kda : parseFloat(String(player.kda) || '0'));
  
  const playerCsPerMin = cspmOverride !== null ? cspmOverride : 
    (typeof player.csPerMin === 'number' ? player.csPerMin : parseFloat(String(player.csPerMin) || '0'));
  
  const playerDamageShare = damageShareOverride !== null ? damageShareOverride : 
    (typeof player.damageShare === 'number' ? player.damageShare : parseFloat(String(player.damageShare) || '0'));

  const normalizedRole = normalizeRoleName(player.role);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl border border-gray-100 shadow-subtle p-6 mb-8"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 relative flex-shrink-0">
          {player.image ? (
            <img 
              src={player.image} 
              alt={player.name} 
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null; // Prevent infinite error loop
                target.src = "/placeholder.svg";
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <Shield className="h-8 w-8 text-gray-300 mb-1" />
              <span className="text-2xl font-bold text-gray-400">{player.name.charAt(0)}</span>
            </div>
          )}
          <div className={`absolute bottom-0 left-0 right-0 h-7 ${getRoleColor(normalizedRole)} flex items-center justify-center`}>
            <span className="text-white text-xs font-medium">{getRoleDisplayName(normalizedRole)}</span>
          </div>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold mb-1">{player.name}</h1>
          <div className="flex items-center gap-2">
            {isLogoLoading ? (
              <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
            ) : (
              <Avatar className="w-6 h-6">
                {!logoError && teamLogo ? (
                  <AvatarImage 
                    src={teamLogo} 
                    alt={`${teamName} logo`}
                    className="object-contain"
                    onError={() => setLogoError(true)}
                  />
                ) : null}
                <AvatarFallback>
                  {teamName?.substring(0, 2).toUpperCase() || "TM"}
                </AvatarFallback>
              </Avatar>
            )}
            <p className="text-gray-600">{teamName}</p>
          </div>
        </div>
        
        <div className="ml-auto grid grid-cols-2 sm:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex justify-center mb-1">
              <Activity size={18} className="text-lol-blue" />
            </div>
            <p className="text-2xl font-bold">{playerKda.toFixed(2)}</p>
            <p className="text-xs text-gray-500">KDA</p>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center mb-1">
              <Trophy size={18} className="text-lol-blue" />
            </div>
            <p className="text-2xl font-bold">{playerCsPerMin.toFixed(1)}</p>
            <p className="text-xs text-gray-500">CS/Min</p>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center mb-1">
              <Award size={18} className="text-lol-blue" />
            </div>
            <p className="text-2xl font-bold">{Math.round(playerDamageShare * 100)}%</p>
            <p className="text-xs text-gray-500">Damage Share</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PlayerHeader;
