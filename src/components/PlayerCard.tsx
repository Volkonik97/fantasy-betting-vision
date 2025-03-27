
import React from "react";
import { Player } from "@/utils/models/types";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface PlayerCardProps {
  player: Player & { teamName?: string; teamRegion?: string };
}

const PlayerCard = ({ player }: PlayerCardProps) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case "Top":
        return "bg-yellow-100 text-yellow-800";
      case "Jungle":
        return "bg-green-100 text-green-800";
      case "Mid":
        return "bg-blue-100 text-blue-800";
      case "ADC":
        return "bg-red-100 text-red-800";
      case "Support":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Ensure championPool is an array
  const championPoolArray = Array.isArray(player.championPool) 
    ? player.championPool 
    : typeof player.championPool === 'string' 
      ? player.championPool.split(',').map(c => c.trim()).filter(c => c) 
      : [];

  // Format KDA value
  const formattedKDA = typeof player.kda === 'number' 
    ? player.kda.toFixed(1) 
    : typeof player.kda === 'string' 
      ? parseFloat(player.kda).toFixed(1) 
      : '0.0';

  // Format CS per minute
  const formattedCsPerMin = typeof player.csPerMin === 'number' 
    ? player.csPerMin.toFixed(1) 
    : typeof player.csPerMin === 'string' 
      ? parseFloat(player.csPerMin).toFixed(1) 
      : '0.0';

  // Format damage share percentage
  const formattedDamageShare = typeof player.damageShare === 'number' 
    ? Math.round(player.damageShare * 100) 
    : typeof player.damageShare === 'string' 
      ? Math.round(parseFloat(player.damageShare) * 100) 
      : 0;

  // Display the team name directly from the player object if available
  const teamName = player.teamName || player.team;

  return (
    <Link to={`/players/${player.id}`}>
      <motion.div 
        className="bg-white rounded-xl border border-gray-100 shadow-subtle overflow-hidden hover:shadow-md transition-shadow duration-300"
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
      >
        <div className="h-36 relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          <img 
            src={player.image} 
            alt={player.name} 
            className="w-full h-full object-cover object-top"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
        </div>
        
        <div className="p-4 -mt-5 relative">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-lg">{player.name}</h3>
              <span className="text-sm text-gray-500 block">
                {teamName}
              </span>
            </div>
            
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getRoleColor(player.role)}`}>
              {player.role}
            </span>
          </div>
          
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-gray-50 rounded-md">
              <span className="text-xs text-gray-500 block mb-1">KDA</span>
              <span className="text-lg font-semibold">{formattedKDA}</span>
            </div>
            
            <div className="text-center p-2 bg-gray-50 rounded-md">
              <span className="text-xs text-gray-500 block mb-1">CS/Min</span>
              <span className="text-lg font-semibold">{formattedCsPerMin}</span>
            </div>
            
            <div className="text-center p-2 bg-gray-50 rounded-md">
              <span className="text-xs text-gray-500 block mb-1">DMG Share</span>
              <span className="text-lg font-semibold">{formattedDamageShare}%</span>
            </div>
          </div>
          
          <div className="mt-4">
            <span className="text-xs text-gray-500 block mb-2">Champion Pool</span>
            <div className="flex flex-wrap gap-2">
              {championPoolArray.length > 0 ? (
                championPoolArray.slice(0, 3).map((champion, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
                  >
                    {champion}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400">Aucun champion</span>
              )}
              {championPoolArray.length > 3 && (
                <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded-md">
                  +{championPoolArray.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default PlayerCard;
