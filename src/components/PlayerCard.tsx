
import React from "react";
import { Player } from "@/utils/mockData";
import { motion } from "framer-motion";

interface PlayerCardProps {
  player: Player;
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

  return (
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
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
      </div>
      
      <div className="p-4 -mt-5 relative">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-lg">{player.name}</h3>
            <span className="text-sm text-gray-500 block">
              {player.team === "t1" ? "T1" : 
               player.team === "geng" ? "Gen.G" : 
               player.team === "jdg" ? "JD Gaming" : 
               player.team === "fnc" ? "Fnatic" : 
               player.team === "c9" ? "Cloud9" : player.team}
            </span>
          </div>
          
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getRoleColor(player.role)}`}>
            {player.role}
          </span>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-gray-50 rounded-md">
            <span className="text-xs text-gray-500 block mb-1">KDA</span>
            <span className="text-lg font-semibold">{player.kda.toFixed(1)}</span>
          </div>
          
          <div className="text-center p-2 bg-gray-50 rounded-md">
            <span className="text-xs text-gray-500 block mb-1">CS/Min</span>
            <span className="text-lg font-semibold">{player.csPerMin.toFixed(1)}</span>
          </div>
          
          <div className="text-center p-2 bg-gray-50 rounded-md">
            <span className="text-xs text-gray-500 block mb-1">DMG Share</span>
            <span className="text-lg font-semibold">{(player.damageShare * 100).toFixed(0)}%</span>
          </div>
        </div>
        
        <div className="mt-4">
          <span className="text-xs text-gray-500 block mb-2">Champion Pool</span>
          <div className="flex flex-wrap gap-2">
            {player.championPool.map((champion) => (
              <span 
                key={champion}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
              >
                {champion}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PlayerCard;
