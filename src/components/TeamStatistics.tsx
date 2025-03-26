
import React from "react";
import { Team } from "@/utils/mockData";
import { motion } from "framer-motion";
import { formatSecondsToMinutesSeconds } from "@/utils/dataConverter";

interface TeamStatisticsProps {
  team: Team;
}

const TeamStatistics = ({ team }: TeamStatisticsProps) => {
  const stats = [
    { name: "Win Rate", value: `${(team.winRate * 100).toFixed(0)}%` },
    { name: "Blue Side Win", value: `${(team.blueWinRate * 100).toFixed(0)}%` },
    { name: "Red Side Win", value: `${(team.redWinRate * 100).toFixed(0)}%` },
    { name: "Avg Game Time", value: formatSecondsToMinutesSeconds(team.averageGameTime * 60) },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-subtle overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-50 rounded-full p-1 flex items-center justify-center overflow-hidden">
            <img
              src={team.logo}
              alt={team.name}
              className="w-9 h-9 object-contain"
            />
          </div>
          <div>
            <h3 className="font-medium text-lg">{team.name}</h3>
            <span className="text-sm text-gray-500">{team.region}</span>
          </div>
        </div>
        
        <span className="px-3 py-1 bg-gray-50 rounded-md text-sm font-medium">
          Rank #1
        </span>
      </div>
      
      <div className="p-4">
        <h4 className="text-sm font-medium text-gray-500 mb-3">Team Statistics</h4>
        
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <motion.div 
              key={stat.name}
              className="bg-gray-50 rounded-lg p-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <span className="text-xs text-gray-500 block mb-1">{stat.name}</span>
              <span className="text-lg font-semibold">{stat.value}</span>
            </motion.div>
          ))}
        </div>
        
        <h4 className="text-sm font-medium text-gray-500 mt-6 mb-3">Players</h4>
        
        <div className="space-y-3">
          {team.players.map((player) => (
            <motion.div 
              key={player.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full shadow-subtle overflow-hidden">
                  <img 
                    src={player.image} 
                    alt={player.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h5 className="font-medium">{player.name}</h5>
                  <span className="text-xs text-gray-500">{player.role}</span>
                </div>
              </div>
              
              <div className="text-right">
                <span className="text-sm font-medium">{player.kda.toFixed(2)} KDA</span>
                <span className="text-xs text-gray-500 block">
                  {(player.damageShare * 100).toFixed(0)}% DMG Share
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamStatistics;
