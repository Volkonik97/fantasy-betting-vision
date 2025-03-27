
import React from "react";
import { Player } from "@/utils/models/types";
import { Activity, Trophy, Award } from "lucide-react";
import { motion } from "framer-motion";

interface PlayerHeaderProps {
  player: Player;
  teamName: string;
}

const PlayerHeader = ({ player, teamName }: PlayerHeaderProps) => {
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
  
  const playerKda = typeof player.kda === 'number' ? player.kda : parseFloat(String(player.kda) || '0');
  const playerCsPerMin = typeof player.csPerMin === 'number' ? player.csPerMin : parseFloat(String(player.csPerMin) || '0');
  const playerDamageShare = typeof player.damageShare === 'number' ? player.damageShare : parseFloat(String(player.damageShare) || '0');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl border border-gray-100 shadow-subtle p-6 mb-8"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center relative">
          <img 
            src={player.image} 
            alt={player.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
            }}
          />
          <div className={`absolute bottom-0 left-0 right-0 h-6 ${getRoleColor(player.role)} flex items-center justify-center`}>
            <span className="text-white text-xs font-medium">{player.role}</span>
          </div>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold mb-1">{player.name}</h1>
          <p className="text-gray-600">{teamName}</p>
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
