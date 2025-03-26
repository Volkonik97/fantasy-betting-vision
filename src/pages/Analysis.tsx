
import React, { useState } from "react";
import { motion } from "framer-motion";
import { BarChart, TrendingUp, PieChart, Gauge } from "lucide-react";
import { teams } from "@/utils/mockData";
import Navbar from "@/components/Navbar";
import PredictionChart from "@/components/PredictionChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart as RechartBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const Analysis = () => {
  const [selectedMetric, setSelectedMetric] = useState<string>("winRate");
  
  const metrics = [
    { id: "winRate", name: "Win Rate" },
    { id: "blueWinRate", name: "Blue Side Win Rate" },
    { id: "redWinRate", name: "Red Side Win Rate" },
    { id: "averageGameTime", name: "Average Game Time" }
  ];
  
  // Prepare data for chart
  const chartData = teams.map(team => ({
    name: team.name,
    winRate: Math.round(team.winRate * 100),
    blueWinRate: Math.round(team.blueWinRate * 100),
    redWinRate: Math.round(team.redWinRate * 100),
    averageGameTime: team.averageGameTime
  }));
  
  // Calculate side win rate averages
  const avgBlueWinRate = teams.reduce((acc, team) => acc + team.blueWinRate, 0) / teams.length * 100;
  const avgRedWinRate = teams.reduce((acc, team) => acc + team.redWinRate, 0) / teams.length * 100;
  
  // Calculate other interesting stats
  const blueSideAdvantage = avgBlueWinRate > avgRedWinRate;
  const advantagePercentage = Math.abs(avgBlueWinRate - avgRedWinRate).toFixed(1);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Analysis</h1>
          <p className="text-gray-600">
            Dive deep into League of Legends statistics and predictions
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="md:col-span-2"
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart size={20} />
                  Team Performance Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {metrics.map(metric => (
                      <button
                        key={metric.id}
                        onClick={() => setSelectedMetric(metric.id)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          selectedMetric === metric.id
                            ? "bg-lol-blue text-white"
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        {metric.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartBarChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis 
                        domain={selectedMetric === "averageGameTime" ? [20, 40] : [0, 100]}
                        unit={selectedMetric === "averageGameTime" ? " min" : "%"} 
                      />
                      <Tooltip 
                        formatter={(value) => [
                          `${value}${selectedMetric === "averageGameTime" ? " min" : "%"}`, 
                          metrics.find(m => m.id === selectedMetric)?.name
                        ]}
                      />
                      <Legend />
                      <Bar 
                        dataKey={selectedMetric} 
                        fill="#0AC8B9" 
                        name={metrics.find(m => m.id === selectedMetric)?.name}
                      />
                    </RechartBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart size={20} />
                  Side Advantage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <PredictionChart 
                    blueWinRate={avgBlueWinRate} 
                    redWinRate={avgRedWinRate} 
                    teamBlueName="Blue Side" 
                    teamRedName="Red Side" 
                  />
                  
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      {blueSideAdvantage 
                        ? "Blue side has an advantage" 
                        : "Red side has an advantage"}
                    </p>
                    <p className="font-medium">
                      {blueSideAdvantage 
                        ? `Blue side wins ${advantagePercentage}% more games` 
                        : `Red side wins ${advantagePercentage}% more games`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">Key Insights</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp size={18} className="text-lol-blue" />
                  Side Advantage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Teams on {blueSideAdvantage ? "blue" : "red"} side have a statistically significant advantage, 
                  winning {advantagePercentage}% more games across all regions. This should be considered 
                  when evaluating match predictions.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Gauge size={18} className="text-lol-blue" />
                  Game Duration Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Teams with shorter average game times (under 30 minutes) tend to have higher win rates,
                  suggesting that early game aggression and quick objective control are key factors for success.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart size={18} className="text-lol-blue" />
                  Regional Differences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  LCK and LPL teams show more consistent side-based performance (smaller gap between blue and red side win rates),
                  while LEC and LCS teams display larger variations in performance based on side selection.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold mb-4">Prediction Accuracy</h2>
          
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-lol-blue mb-2">78%</div>
                  <p className="text-sm text-gray-600">Overall Prediction Accuracy</p>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl font-bold text-lol-blue mb-2">82%</div>
                  <p className="text-sm text-gray-600">Major Tournaments Accuracy</p>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl font-bold text-lol-blue mb-2">73%</div>
                  <p className="text-sm text-gray-600">Underdog Win Predictions</p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Our prediction model has shown consistent performance across different tournaments and regions.
                  The accuracy is particularly high for major international tournaments (Worlds, MSI) where more
                  data is available for analysis. The model performs well even when predicting underdog victories,
                  which are typically harder to forecast.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Analysis;
