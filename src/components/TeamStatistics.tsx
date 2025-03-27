
import React from "react";
import { Team } from "@/utils/models/types";
import { motion } from "framer-motion";
import { formatSecondsToMinutesSeconds } from "@/utils/dataConverter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TeamStatisticsProps {
  team: Team;
  timelineStats?: any;
}

const TeamStatistics = ({ team, timelineStats }: TeamStatisticsProps) => {
  const stats = [
    { name: "Win Rate", value: `${(team.winRate * 100).toFixed(0)}%` },
    { name: "Blue Side Win", value: `${(team.blueWinRate * 100).toFixed(0)}%` },
    { name: "Red Side Win", value: `${(team.redWinRate * 100).toFixed(0)}%` },
    { name: "Avg Game Time", value: formatSecondsToMinutesSeconds(team.averageGameTime) },
  ];

  const hasTimeline = timelineStats && Object.keys(timelineStats).length > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-subtle overflow-hidden h-full">
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
          Statistiques
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
        
        {hasTimeline && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-500 mb-3">Timeline Statistics</h4>
            <Tabs defaultValue="gold">
              <TabsList className="w-full mb-4 grid grid-cols-3">
                <TabsTrigger value="gold">Gold</TabsTrigger>
                <TabsTrigger value="cs">CS</TabsTrigger>
                <TabsTrigger value="kda">K/D</TabsTrigger>
              </TabsList>
              
              <TabsContent value="gold">
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(timelineStats).map(([time, stats]: [string, any]) => (
                      <div key={time} className="bg-slate-50 p-3 rounded-lg text-center">
                        <div className="text-sm text-gray-500 mb-1">{time} min</div>
                        <div className="font-semibold">{stats.avgGold.toLocaleString()}</div>
                        <div className={`text-xs mt-1 ${stats.avgGoldDiff > 0 ? 'text-green-600' : stats.avgGoldDiff < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                          {stats.avgGoldDiff > 0 ? '+' : ''}{stats.avgGoldDiff.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="cs">
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(timelineStats).map(([time, stats]: [string, any]) => (
                      <div key={time} className="bg-slate-50 p-3 rounded-lg text-center">
                        <div className="text-sm text-gray-500 mb-1">{time} min</div>
                        <div className="font-semibold">{stats.avgCs}</div>
                        <div className="text-xs mt-1 text-gray-600">
                          {(stats.avgCs / parseInt(time)).toFixed(1)} CS/min
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="kda">
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(timelineStats).map(([time, stats]: [string, any]) => (
                      <div key={time} className="bg-slate-50 p-3 rounded-lg text-center">
                        <div className="text-sm text-gray-500 mb-1">{time} min</div>
                        <div className="font-semibold">
                          {stats.avgKills} / {stats.avgDeaths}
                        </div>
                        <div className="text-xs mt-1 text-gray-600">
                          {(stats.avgKills / (stats.avgDeaths || 1)).toFixed(1)} KDA
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamStatistics;
