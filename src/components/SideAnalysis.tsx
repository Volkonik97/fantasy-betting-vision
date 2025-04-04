
import React, { useEffect } from "react";
import { SideStatistics, TimelineStats, TimelineStatPoint } from "@/utils/models/types";
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
  
  // Win rate data
  const sideWinRateData = [
    {
      name: "Win Rate",
      blue: ensureValidData(statistics.blueWins),
      red: ensureValidData(statistics.redWins)
    }
  ];
  
  // Create array of available objectives for display
  const objectivesToShow = [
    { key: "blueFirstBlood", redKey: "redFirstBlood", name: "First Blood" },
    { key: "blueFirstDragon", redKey: "redFirstDragon", name: "First Dragon" },
    { key: "blueFirstHerald", redKey: "redFirstHerald", name: "First Herald" },
    { key: "blueFirstTower", redKey: "redFirstTower", name: "First Tower" },
    { key: "blueFirstBaron", redKey: "redFirstBaron", name: "First Baron" }
  ].filter(obj => 
    // Only include objectives that have data
    statistics[obj.key] !== undefined || statistics[obj.redKey] !== undefined
  );
  
  // First objective data - only include objectives that are present in the statistics
  const firstObjectiveData = objectivesToShow.map(obj => ({
    name: obj.name,
    blue: ensureValidData(statistics[obj.key]),
    red: ensureValidData(statistics[obj.redKey])
  }));
  
  console.log("BarChart data:", firstObjectiveData);
  
  // Check if timeline stats exist and are not null
  const hasTimeline = statistics.timelineStats && 
    statistics.timelineStats !== null &&
    Object.keys(statistics.timelineStats).length > 0;
  
  return (
    <div className="space-y-6">
      {/* Win Rate Card */}
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
      
      {/* First Objectives Card - Only show if we have objective data */}
      {firstObjectiveData.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">First Objectives</CardTitle>
            <CardDescription>Percentage of securing objectives first</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <BarChart
                data={firstObjectiveData}
                xAxisKey="name"
                grid={false}
                colors={["#3b82f6", "#ef4444"]}
                layout="vertical"
                barSize={20}
                showYAxis={true}
                height={350}
              >
                <Bar dataKey="blue" name="Blue Side" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                <Bar dataKey="red" name="Red Side" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Timeline Statistics Card - Only shown if timeline data exists */}
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
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.entries(statistics.timelineStats).map(([time, stats]) => {
                      const statData = stats as TimelineStatPoint;
                      return (
                        <div key={time} className="bg-slate-50 p-3 rounded-lg text-center">
                          <div className="text-sm text-gray-500 mb-1">{time} min</div>
                          <div className="font-semibold">{statData.avgGold.toLocaleString()}</div>
                          <div className={`text-xs mt-1 ${statData.avgGoldDiff > 0 ? 'text-green-600' : statData.avgGoldDiff < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                            {statData.avgGoldDiff > 0 ? '+' : ''}{statData.avgGoldDiff.toLocaleString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="cs">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.entries(statistics.timelineStats).map(([time, stats]) => {
                      const statData = stats as TimelineStatPoint;
                      return (
                        <div key={time} className="bg-slate-50 p-3 rounded-lg text-center">
                          <div className="text-sm text-gray-500 mb-1">{time} min</div>
                          <div className="font-semibold">{statData.avgCs}</div>
                          <div className={`text-xs mt-1 ${statData.avgCsDiff > 0 ? 'text-green-600' : statData.avgCsDiff < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                            {statData.avgCsDiff > 0 ? '+' : ''}{statData.avgCsDiff}
                            <span className="text-gray-600 ml-1">({(statData.avgCs / parseInt(time)).toFixed(1)} CS/min)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="kda">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.entries(statistics.timelineStats).map(([time, stats]) => {
                      const statData = stats as TimelineStatPoint;
                      return (
                        <div key={time} className="bg-slate-50 p-3 rounded-lg text-center">
                          <div className="text-sm text-gray-500 mb-1">{time} min</div>
                          <div className="font-semibold">
                            {statData.avgKills.toFixed(1)} / {statData.avgDeaths.toFixed(1)} {statData.avgAssists && `/ ${statData.avgAssists.toFixed(1)}`}
                          </div>
                          <div className="text-xs mt-1 text-gray-600">
                            {(statData.avgKills / (statData.avgDeaths || 1)).toFixed(1)} KDA
                          </div>
                        </div>
                      );
                    })}
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
