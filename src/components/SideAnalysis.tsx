
import React, { useEffect } from "react";
import { SideStatistics } from "@/utils/models/types";
import { Bar } from "recharts";
import { BarChart } from "./ui/barchart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export interface SideAnalysisProps {
  statistics: SideStatistics;
}

const SideAnalysis = ({ statistics }: SideAnalysisProps) => {
  // Ensure we have valid data for the charts
  const ensureValidData = (value: number) => isNaN(value) ? 0 : Math.max(0, Math.min(100, value));
  
  // Debug logging
  useEffect(() => {
    console.log("SideAnalysis rendering with stats:", statistics);
  }, [statistics]);
  
  const sideWinRateData = [
    {
      name: "Win Rate",
      blue: ensureValidData(statistics.blueWins),
      red: ensureValidData(statistics.redWins)
    }
  ];
  
  const firstObjectiveData = [
    {
      name: "First Blood",
      blue: ensureValidData(statistics.blueFirstBlood),
      red: ensureValidData(statistics.redFirstBlood)
    },
    {
      name: "First Dragon",
      blue: ensureValidData(statistics.blueFirstDragon),
      red: ensureValidData(statistics.redFirstDragon)
    },
    {
      name: "First Herald",
      blue: ensureValidData(statistics.blueFirstHerald),
      red: ensureValidData(statistics.redFirstHerald)
    },
    {
      name: "First Tower",
      blue: ensureValidData(statistics.blueFirstTower),
      red: ensureValidData(statistics.redFirstTower)
    }
  ];
  
  const hasTimeline = statistics.timelineStats && 
    Object.keys(statistics.timelineStats).length > 0;
  
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Side Win Rate</CardTitle>
          <CardDescription>Performance on blue vs red side</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <BarChart
              data={sideWinRateData}
              xAxisKey="name"
              grid={false}
              colors={["#3b82f6", "#ef4444"]}
              layout="horizontal"
              barSize={40}
            >
              <Bar dataKey="blue" name="Blue Side" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="red" name="Red Side" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </div>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">First Objectives</CardTitle>
          <CardDescription>Percentage of securing objectives first</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <BarChart
              data={firstObjectiveData}
              xAxisKey="name"
              grid={false}
              colors={["#3b82f6", "#ef4444"]}
              layout="vertical"
              barSize={20}
            >
              <Bar dataKey="blue" name="Blue Side" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              <Bar dataKey="red" name="Red Side" fill="#ef4444" radius={[0, 4, 4, 0]} />
            </BarChart>
          </div>
        </CardContent>
      </Card>
      
      {hasTimeline && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Timeline Statistics</CardTitle>
            <CardDescription>Performance metrics at different game stages</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="gold">
              <TabsList className="w-full mb-4 grid grid-cols-3">
                <TabsTrigger value="gold">Gold</TabsTrigger>
                <TabsTrigger value="cs">CS</TabsTrigger>
                <TabsTrigger value="kda">K/D</TabsTrigger>
              </TabsList>
              
              <TabsContent value="gold">
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(statistics.timelineStats).map(([time, stats]) => (
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
                    {Object.entries(statistics.timelineStats).map(([time, stats]) => (
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
                    {Object.entries(statistics.timelineStats).map(([time, stats]) => (
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
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SideAnalysis;
