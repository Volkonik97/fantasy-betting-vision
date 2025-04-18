
import React, { useState, useEffect } from "react";
import { Player } from "@/utils/models/types";
import { Activity, Trophy, Award } from "lucide-react";
import { motion } from "framer-motion";
import { getTeamLogoUrl } from "@/utils/database/teams/logoUtils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getRoleColor, getRoleDisplayName } from "./RoleBadge";
import PlayerImage from "./PlayerImage";

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
    const fetchTeamLogo = async () => {
      if (player.team) {
        setIsLogoLoading(true);
        setLogoError(false);
        try {
          const logoUrl = await getTeamLogoUrl(player.team);
          setTeamLogo(logoUrl);
        } catch (error) {
          console.error("Error fetching team logo:", error);
          setLogoError(true);
        } finally {
          setIsLogoLoading(false);
        }
      }
    };

    fetchTeamLogo();
  }, [player.team]);
  
  console.log("PlayerHeader damageShare:", 
    player.damageShare, 
    typeof player.damageShare, 
    "Override:", 
    damageShareOverride
  );
  
  const playerKda = kdaOverride !== null ? kdaOverride : 
    (typeof player.kda === 'number' ? player.kda : parseFloat(String(player.kda) || '0'));
  
  const playerCsPerMin = cspmOverride !== null ? cspmOverride : 
    (typeof player.csPerMin === 'number' ? player.csPerMin : parseFloat(String(player.csPerMin) || '0'));
  
  // Improved damage share formatting
  const getDamageShareValue = () => {
    // Define damageShareValue with the correct type
    let damageShareValue: number | string = damageShareOverride !== null 
      ? damageShareOverride 
      : player.damageShare;
    
    console.log("Processing damageShareValue:", damageShareValue, typeof damageShareValue);
    
    // Convert to number if it's a string
    if (typeof damageShareValue === 'string') {
      // Now TypeScript knows damageShareValue is a string, so replace is valid
      damageShareValue = parseFloat(damageShareValue.replace('%', ''));
    }
    
    // If it's a decimal between 0-1, convert to percentage
    if (typeof damageShareValue === 'number' && damageShareValue >= 0 && damageShareValue <= 1) {
      damageShareValue = damageShareValue * 100;
    }
    
    // Format the final value
    return `${Math.round(Number(damageShareValue) || 0)}%`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl border border-gray-100 shadow-subtle p-6 mb-8"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 relative flex-shrink-0">
          <PlayerImage 
            name={player.name}
            playerId={player.id}
            image={player.image}
            role={player.role}
          />
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
            <p className="text-2xl font-bold">{getDamageShareValue()}</p>
            <p className="text-xs text-gray-500">Damage Share</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PlayerHeader;
