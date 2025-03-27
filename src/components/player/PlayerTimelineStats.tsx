
import React from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TimelineStatsProps {
  timelineStats: any;
}

const PlayerTimelineStats = ({ timelineStats }: TimelineStatsProps) => {
  if (!timelineStats) {
    return (
      <Card className="bg-white rounded-xl border border-gray-100 shadow-subtle">
        <CardHeader>
          <CardTitle>Statistiques par temps de jeu</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-6">Aucune statistique disponible pour ce joueur</p>
        </CardContent>
      </Card>
    );
  }
  
  // Prepare data for the charts
  const prepareChartData = () => {
    const timePoints = ["10", "15", "20", "25"];
    return timePoints.map(time => ({
      time: `${time}m`,
      gold: timelineStats[time]?.avgGold || 0,
      xp: timelineStats[time]?.avgXp || 0,
      cs: timelineStats[time]?.avgCs || 0,
      goldDiff: timelineStats[time]?.avgGoldDiff || 0,
      kills: timelineStats[time]?.avgKills || 0,
      deaths: timelineStats[time]?.avgDeaths || 0
    }));
  };
  
  const chartData = prepareChartData();
  
  // Format large numbers with k suffix
  const formatValue = (value: number) => {
    return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value;
  };
  
  return (
    <Card className="bg-white rounded-xl border border-gray-100 shadow-subtle">
      <CardHeader>
        <CardTitle>Statistiques par temps de jeu</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="resources">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="resources" className="flex-1">Ressources</TabsTrigger>
            <TabsTrigger value="combat" className="flex-1">Combat</TabsTrigger>
            <TabsTrigger value="advantage" className="flex-1">Avantage</TabsTrigger>
          </TabsList>
          
          <TabsContent value="resources">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis tickFormatter={formatValue} />
                  <Tooltip 
                    formatter={(value: number) => [`${formatValue(value)}`, '']}
                    labelFormatter={(label) => `À ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="gold" 
                    name="Or" 
                    stroke="#FFD700" 
                    strokeWidth={2} 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cs" 
                    name="CS" 
                    stroke="#82ca9d" 
                    strokeWidth={2} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="xp" 
                    name="XP" 
                    stroke="#8884d8" 
                    strokeWidth={2} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="combat">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(1)}`, '']}
                    labelFormatter={(label) => `À ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="kills" 
                    name="Éliminations" 
                    stroke="#1E88E5" 
                    strokeWidth={2} 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="deaths" 
                    name="Morts" 
                    stroke="#D32F2F" 
                    strokeWidth={2} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="advantage">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis tickFormatter={formatValue} />
                  <Tooltip 
                    formatter={(value: number) => [`${formatValue(value)}`, '']}
                    labelFormatter={(label) => `À ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="goldDiff" 
                    name="Différence d'or" 
                    stroke="#FFB300" 
                    strokeWidth={2} 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {["10", "15", "20", "25"].map(time => (
            <div key={time} className="p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-600">{time} min</h4>
              <div className="mt-1 space-y-1">
                <p className="text-xs flex justify-between">
                  <span>Or:</span> 
                  <span className="font-medium">{formatValue(timelineStats[time]?.avgGold || 0)}</span>
                </p>
                <p className="text-xs flex justify-between">
                  <span>CS:</span> 
                  <span className="font-medium">{timelineStats[time]?.avgCs || 0}</span>
                </p>
                <p className="text-xs flex justify-between">
                  <span>K/D:</span> 
                  <span className="font-medium">
                    {timelineStats[time]?.avgKills?.toFixed(1) || 0}/{timelineStats[time]?.avgDeaths?.toFixed(1) || 0}
                  </span>
                </p>
                <p className="text-xs flex justify-between">
                  <span>Diff. Or:</span> 
                  <span className={`font-medium ${timelineStats[time]?.avgGoldDiff > 0 ? 'text-green-600' : timelineStats[time]?.avgGoldDiff < 0 ? 'text-red-600' : ''}`}>
                    {timelineStats[time]?.avgGoldDiff > 0 ? '+' : ''}{formatValue(timelineStats[time]?.avgGoldDiff || 0)}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerTimelineStats;
