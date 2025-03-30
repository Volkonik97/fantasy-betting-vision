import React, { useState, useEffect } from "react";
import { Team } from "@/utils/models/types";
import { motion } from "framer-motion";
import { formatTime } from "@/utils/formatters/timeFormatter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getTeamLogoUrl } from "@/utils/database/teams/logoUtils";

interface TeamStatisticsProps {
  team: Team;
  timelineStats?: any;
}

const TeamStatistics = ({ team, timelineStats }: TeamStatisticsProps) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(team.logo || null);
  const [logoLoading, setLogoLoading] = useState(true);
  const [logoError, setLogoError] = useState(false);
  
  useEffect(() => {
    const fetchLogo = async () => {
      if (!team.id) return;

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
          console.log(`Logo found for ${team.name} in statistics: ${url}`);
          setLogoUrl(url);
        } else {
          // Set logo error if no valid URL found
          setLogoError(true);
        }
      } catch (error) {
        console.error(`Error fetching logo for ${team.name}:`, error);
        setLogoError(true);
      } finally {
        setLogoLoading(false);
      }
    };
    
    fetchLogo();
  }, [team.id, team.logo, team.name]);

  const stats = [
    { name: "Win Rate", value: `${(team.winRate * 100).toFixed(0)}%` },
    { name: "Blue Side Win", value: `${(team.blueWinRate * 100).toFixed(0)}%` },
    { name: "Red Side Win", value: `${(team.redWinRate * 100).toFixed(0)}%` },
    { name: "Avg Game Time", value: formatTime(team.averageGameTime) },
  ];

  const hasTimeline = timelineStats && Object.keys(timelineStats).length > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-subtle overflow-hidden h-full">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-50 rounded-full p-1 flex items-center justify-center overflow-hidden">
            {logoLoading ? (
              <div className="animate-pulse w-8 h-8 bg-gray-200 rounded-full"></div>
            ) : logoUrl && !logoError ? (
              <Avatar className="w-10 h-10">
                <AvatarImage
                  src={logoUrl}
                  alt={`${team.name} logo`}
                  className="object-contain"
                  onError={() => {
                    console.log(`Error loading logo for ${team.name} in statistics`);
                    setLogoError(true);
                  }}
                />
                <AvatarFallback className="text-xs font-medium bg-gray-100 text-gray-700">
                  {team.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <Avatar className="w-10 h-10">
                <AvatarFallback className="text-xs font-medium bg-gray-100 text-gray-700">
                  {team.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
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
