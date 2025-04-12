
import React, { useState } from "react";
import { Line, LineChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TimelineStats } from "@/utils/models/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TimelineChartProps {
  teamName: string;
  opponentName: string;
  teamTimelineStats: TimelineStats;
  opponentTimelineStats: TimelineStats;
}

const TimelineChart = ({ 
  teamName, 
  opponentName, 
  teamTimelineStats, 
  opponentTimelineStats 
}: TimelineChartProps) => {
  const [activeMetric, setActiveMetric] = useState<"gold" | "cs" | "kda">("gold");

  // Transform timeline stats into chart data
  const timepoints = Object.keys(teamTimelineStats).sort((a, b) => parseInt(a) - parseInt(b));
  
  const getChartData = () => {
    return timepoints.map(timepoint => {
      const teamStats = teamTimelineStats[timepoint];
      const oppStats = opponentTimelineStats[timepoint];
      
      return {
        name: `${timepoint} min`,
        [`${teamName} Gold`]: teamStats.avgGold,
        [`${opponentName} Gold`]: oppStats.avgGold,
        [`${teamName} CS`]: teamStats.avgCs,
        [`${opponentName} CS`]: oppStats.avgCs,
        [`${teamName} KDA`]: teamStats.avgKills / (teamStats.avgDeaths || 1),
        [`${opponentName} KDA`]: oppStats.avgKills / (oppStats.avgDeaths || 1),
        [`${teamName} Kills`]: teamStats.avgKills,
        [`${opponentName} Kills`]: oppStats.avgKills,
        [`${teamName} Deaths`]: teamStats.avgDeaths,
        [`${opponentName} Deaths`]: oppStats.avgDeaths,
      };
    });
  };

  const chartData = getChartData();
  
  const renderChart = () => {
    switch (activeMetric) {
      case "gold":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => value.toLocaleString()} />
              <Legend />
              <Line type="monotone" dataKey={`${teamName} Gold`} stroke="#3b82f6" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey={`${opponentName} Gold`} stroke="#ef4444" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case "cs":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey={`${teamName} CS`} stroke="#3b82f6" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey={`${opponentName} CS`} stroke="#ef4444" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case "kda":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => value.toFixed(2)} />
              <Legend />
              <Line type="monotone" dataKey={`${teamName} Kills`} stroke="#3b82f6" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey={`${opponentName} Kills`} stroke="#ef4444" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey={`${teamName} Deaths`} stroke="#93c5fd" strokeDasharray="5 5" />
              <Line type="monotone" dataKey={`${opponentName} Deaths`} stroke="#fca5a5" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="gold" onValueChange={(value) => setActiveMetric(value as "gold" | "cs" | "kda")}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="gold">Gold</TabsTrigger>
          <TabsTrigger value="cs">CS</TabsTrigger>
          <TabsTrigger value="kda">K/D</TabsTrigger>
        </TabsList>
        
        <TabsContent value="gold">
          {renderChart()}
        </TabsContent>
        
        <TabsContent value="cs">
          {renderChart()}
        </TabsContent>
        
        <TabsContent value="kda">
          {renderChart()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TimelineChart;
