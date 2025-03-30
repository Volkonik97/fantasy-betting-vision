
import React, { useState, useEffect } from "react";
import { Team } from "@/utils/models/types";
import { motion } from "framer-motion";
import { formatTime } from "@/utils/formatters/timeFormatter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getTeamLogoUrl } from "@/utils/database/teams/logoUtils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, Percent, Clock, Shield, Target, Flame, Mountain, Award } from "lucide-react";

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
    { 
      name: "Win Rate", 
      value: `${(team.winRate * 100).toFixed(0)}%`,
      icon: <Trophy size={18} className="text-amber-500" />,
      color: "bg-amber-50"
    },
    { 
      name: "Blue Side Win", 
      value: `${(team.blueWinRate * 100).toFixed(0)}%`,
      icon: <Percent size={18} className="text-blue-500" />,
      color: "bg-blue-50"
    },
    { 
      name: "Red Side Win", 
      value: `${(team.redWinRate * 100).toFixed(0)}%`,
      icon: <Percent size={18} className="text-red-500" />,
      color: "bg-red-50"
    },
    { 
      name: "Avg Game Time", 
      value: formatTime(team.averageGameTime),
      icon: <Clock size={18} className="text-green-500" />,
      color: "bg-green-50"
    },
  ];

  const hasTimeline = timelineStats && Object.keys(timelineStats).length > 0;

  return (
    <Card className="overflow-hidden h-full">
      <CardHeader className="pb-2 border-b border-gray-100">
        <div className="flex items-center justify-between">
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
              <CardTitle className="text-lg">{team.name}</CardTitle>
              <CardDescription>{team.region}</CardDescription>
            </div>
          </div>
          
          <span className="px-3 py-1 bg-gray-50 rounded-md text-sm font-medium">
            Performance
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="objectives">Objectifs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
              <Shield size={16} className="mr-2 text-lol-blue" />
              Team Performance Metrics
            </h4>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {stats.map((stat, index) => (
                <motion.div 
                  key={stat.name}
                  className={`${stat.color} rounded-lg p-3 border border-gray-50 shadow-sm`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {stat.icon}
                    <span className="text-xs text-gray-500">{stat.name}</span>
                  </div>
                  <span className="text-lg font-semibold">{stat.value}</span>
                </motion.div>
              ))}
            </div>
            
            {hasTimeline && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                  <Target size={16} className="mr-2 text-lol-blue" />
                  Timeline Performance
                </h4>
                <Tabs defaultValue="gold" className="bg-white border border-gray-100 rounded-lg p-3">
                  <TabsList className="w-full mb-4 grid grid-cols-3">
                    <TabsTrigger value="gold">Gold</TabsTrigger>
                    <TabsTrigger value="cs">CS</TabsTrigger>
                    <TabsTrigger value="kda">K/D</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="gold">
                    <div className="space-y-2">
                      <div className="grid grid-cols-4 gap-2">
                        {Object.entries(timelineStats).map(([time, stats]: [string, any]) => (
                          <div key={time} className="bg-slate-50 p-3 rounded-lg text-center shadow-sm">
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
                    <div className="space-y-2">
                      <div className="grid grid-cols-4 gap-2">
                        {Object.entries(timelineStats).map(([time, stats]: [string, any]) => (
                          <div key={time} className="bg-slate-50 p-3 rounded-lg text-center shadow-sm">
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
                    <div className="space-y-2">
                      <div className="grid grid-cols-4 gap-2">
                        {Object.entries(timelineStats).map(([time, stats]: [string, any]) => (
                          <div key={time} className="bg-slate-50 p-3 rounded-lg text-center shadow-sm">
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
          </TabsContent>
          
          <TabsContent value="objectives">
            <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
              <Flame size={16} className="mr-2 text-orange-500" />
              Premier Sang
            </h4>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-3 border border-gray-50 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-gray-500">Côté Bleu</span>
                </div>
                <span className="text-lg font-semibold">
                  {team.blueFirstBlood || 50}%
                </span>
              </div>
              <div className="bg-red-50 rounded-lg p-3 border border-gray-50 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-gray-500">Côté Rouge</span>
                </div>
                <span className="text-lg font-semibold">
                  {team.redFirstBlood || 50}%
                </span>
              </div>
            </div>

            <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
              <Mountain size={16} className="mr-2 text-teal-500" />
              Premier Dragon
            </h4>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-3 border border-gray-50 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-gray-500">Côté Bleu</span>
                </div>
                <span className="text-lg font-semibold">
                  {team.blueFirstDragon || 50}%
                </span>
              </div>
              <div className="bg-red-50 rounded-lg p-3 border border-gray-50 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-gray-500">Côté Rouge</span>
                </div>
                <span className="text-lg font-semibold">
                  {team.redFirstDragon || 50}%
                </span>
              </div>
            </div>

            <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
              <Award size={16} className="mr-2 text-purple-500" />
              Premier Héraut
            </h4>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-3 border border-gray-50 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-gray-500">Côté Bleu</span>
                </div>
                <span className="text-lg font-semibold">
                  {team.blueFirstHerald || 50}%
                </span>
              </div>
              <div className="bg-red-50 rounded-lg p-3 border border-gray-50 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-gray-500">Côté Rouge</span>
                </div>
                <span className="text-lg font-semibold">
                  {team.redFirstHerald || 50}%
                </span>
              </div>
            </div>

            <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
              <Target size={16} className="mr-2 text-amber-500" />
              Première Tour
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-3 border border-gray-50 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-gray-500">Côté Bleu</span>
                </div>
                <span className="text-lg font-semibold">
                  {team.blueFirstTower || 50}%
                </span>
              </div>
              <div className="bg-red-50 rounded-lg p-3 border border-gray-50 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-gray-500">Côté Rouge</span>
                </div>
                <span className="text-lg font-semibold">
                  {team.redFirstTower || 50}%
                </span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TeamStatistics;
