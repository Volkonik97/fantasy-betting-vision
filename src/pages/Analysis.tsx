
import React, { useState } from "react";
import { motion } from "framer-motion";
import { BarChart, TrendingUp, PieChart, Gauge, ChartBarIcon, ArrowDownRight, ArrowUpRight, Clock, Calendar, Search } from "lucide-react";
import { teams, matches } from "@/utils/mockData";
import Navbar from "@/components/Navbar";
import PredictionChart from "@/components/PredictionChart";
import SearchBar from "@/components/SearchBar";
import SideAnalysis from "@/components/SideAnalysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart as RechartBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";

const Analysis = () => {
  const [selectedMetric, setSelectedMetric] = useState<string>("winRate");
  const [selectedTeam, setSelectedTeam] = useState<string>(teams[0].id);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("month");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const metrics = [
    { id: "winRate", name: "Win Rate" },
    { id: "blueWinRate", name: "Blue Side Win Rate" },
    { id: "redWinRate", name: "Red Side Win Rate" },
    { id: "averageGameTime", name: "Average Game Time" }
  ];
  
  const timeRanges = [
    { id: "week", name: "Last Week" },
    { id: "month", name: "Last Month" },
    { id: "quarter", name: "Last Quarter" },
    { id: "year", name: "Last Year" },
  ];
  
  // Prepare data for chart
  const chartData = teams
    .filter(team => team.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .map(team => ({
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
  
  // Generate trend data
  const generateTrendData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    
    return Array(6).fill(0).map((_, index) => {
      const monthIndex = (currentMonth - 5 + index) % 12;
      const month = months[monthIndex < 0 ? monthIndex + 12 : monthIndex];
      return {
        month,
        blueWinRate: 45 + Math.random() * 15,
        redWinRate: 35 + Math.random() * 15,
        overall: 48 + Math.random() * 7
      };
    });
  };
  
  const trendData = generateTrendData();
  
  // Selected team data
  const selectedTeamData = teams.find(team => team.id === selectedTeam);
  
  // Meta trend data
  const metaTrendData = [
    { month: "May", blueSide: 52, redSide: 48 },
    { month: "Jun", blueSide: 53, redSide: 47 },
    { month: "Jul", blueSide: 54, redSide: 46 },
    { month: "Aug", blueSide: 56, redSide: 44 },
    { month: "Sep", blueSide: 57, redSide: 43 },
    { month: "Oct", blueSide: 55, redSide: 45 },
  ];
  
  const objectiveData = [
    { name: "First Blood", blueSide: 52, redSide: 48 },
    { name: "First Tower", blueSide: 58, redSide: 42 },
    { name: "First Dragon", blueSide: 62, redSide: 38 },
    { name: "First Herald", blueSide: 64, redSide: 36 },
    { name: "First Baron", blueSide: 54, redSide: 46 },
  ];
  
  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const getSideStatisticsFromTeamId = (teamId: string) => {
    // This is a mock function; in a real app, you'd fetch this data from your database
    const team = teams.find(t => t.id === teamId);
    
    if (!team) return null;
    
    return {
      teamId: team.id,
      blueWins: Math.round(team.blueWinRate * 100),
      redWins: Math.round(team.redWinRate * 100),
      blueFirstBlood: 55 + Math.floor(Math.random() * 10),
      redFirstBlood: 45 + Math.floor(Math.random() * 10),
      blueFirstDragon: 60 + Math.floor(Math.random() * 15),
      redFirstDragon: 40 + Math.floor(Math.random() * 15),
      blueFirstHerald: 65 + Math.floor(Math.random() * 10),
      redFirstHerald: 35 + Math.floor(Math.random() * 10),
      blueFirstTower: 58 + Math.floor(Math.random() * 12),
      redFirstTower: 42 + Math.floor(Math.random() * 12),
      blueFirstBaron: 54 + Math.floor(Math.random() * 8),
      redFirstBaron: 46 + Math.floor(Math.random() * 8),
      timelineStats: {
        '10': {
          avgGold: 3250,
          avgXp: 4120,
          avgCs: 85,
          avgGoldDiff: 350,
          avgCsDiff: 5,
          avgKills: 1.2,
          avgDeaths: 0.8,
          avgAssists: 1.5
        },
        '15': {
          avgGold: 5120,
          avgXp: 6780,
          avgCs: 130,
          avgGoldDiff: 580,
          avgCsDiff: 8,
          avgKills: 2.5,
          avgDeaths: 1.3,
          avgAssists: 2.8
        },
        '20': {
          avgGold: 7350,
          avgXp: 9450,
          avgCs: 175,
          avgGoldDiff: 850,
          avgCsDiff: 12,
          avgKills: 3.8,
          avgDeaths: 2.1,
          avgAssists: 4.2
        },
        '25': {
          avgGold: 9780,
          avgXp: 12400,
          avgCs: 220,
          avgGoldDiff: 1250,
          avgCsDiff: 15,
          avgKills: 5.2,
          avgDeaths: 3.0,
          avgAssists: 5.7
        }
      }
    };
  };

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
        
        <div className="mb-6">
          <SearchBar onSearch={handleSearch} value={searchQuery} />
        </div>
        
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="team-analysis">Team Analysis</TabsTrigger>
            <TabsTrigger value="side-advantage">Side Advantage</TabsTrigger>
            <TabsTrigger value="meta-trends">Meta Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
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
          </TabsContent>
          
          <TabsContent value="team-analysis">
            <div className="mb-6">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <Select 
                  value={selectedTeam} 
                  onValueChange={setSelectedTeam}
                >
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Select Team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map(team => (
                      <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select 
                  value={selectedTimeRange} 
                  onValueChange={setSelectedTimeRange}
                >
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Time Range" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeRanges.map(range => (
                      <SelectItem key={range.id} value={range.id}>{range.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm font-medium text-gray-500">Win Rate</div>
                      <div className="flex items-center gap-1 text-green-600">
                        <ArrowUpRight size={16} />
                        <span className="text-xs">2.4%</span>
                      </div>
                    </div>
                    <div className="text-3xl font-bold">
                      {selectedTeamData ? (selectedTeamData.winRate * 100).toFixed(1) : 0}%
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm font-medium text-gray-500">Avg. Game Time</div>
                      <div className="flex items-center gap-1 text-red-600">
                        <ArrowDownRight size={16} />
                        <span className="text-xs">1.2 min</span>
                      </div>
                    </div>
                    <div className="text-3xl font-bold">
                      {selectedTeamData ? selectedTeamData.averageGameTime.toFixed(1) : 0} min
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm font-medium text-gray-500">Blue Side Win Rate</div>
                      <div className="flex items-center gap-1 text-green-600">
                        <ArrowUpRight size={16} />
                        <span className="text-xs">3.1%</span>
                      </div>
                    </div>
                    <div className="text-3xl font-bold">
                      {selectedTeamData ? (selectedTeamData.blueWinRate * 100).toFixed(1) : 0}%
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm font-medium text-gray-500">Red Side Win Rate</div>
                      <div className="flex items-center gap-1 text-green-600">
                        <ArrowUpRight size={16} />
                        <span className="text-xs">0.8%</span>
                      </div>
                    </div>
                    <div className="text-3xl font-bold">
                      {selectedTeamData ? (selectedTeamData.redWinRate * 100).toFixed(1) : 0}%
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp size={20} />
                      Win Rate Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={trendData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis domain={[30, 70]} unit="%" />
                          <Tooltip formatter={(value) => [`${value}%`, ""]} />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="overall" 
                            stroke="#0AC8B9" 
                            strokeWidth={2} 
                            name="Overall Win Rate" 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="blueWinRate" 
                            stroke="#1E88E5" 
                            strokeWidth={2} 
                            name="Blue Side Win Rate" 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="redWinRate" 
                            stroke="#E53935" 
                            strokeWidth={2} 
                            name="Red Side Win Rate" 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                {selectedTeamData && getSideStatisticsFromTeamId(selectedTeamData.id) && (
                  <SideAnalysis statistics={getSideStatisticsFromTeamId(selectedTeamData.id)!} />
                )}
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart size={20} />
                  First Objective Control
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartBarChart
                      data={objectiveData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} unit="%" />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip formatter={(value) => [`${value}%`, ""]} />
                      <Legend />
                      <Bar dataKey="blueSide" fill="#1E88E5" name="Blue Side" />
                      <Bar dataKey="redSide" fill="#E53935" name="Red Side" />
                    </RechartBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="side-advantage">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp size={20} />
                    Side Advantage Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={metaTrendData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[40, 60]} unit="%" />
                        <Tooltip formatter={(value) => [`${value}%`, ""]} />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="blueSide" 
                          stackId="1"
                          stroke="#1E88E5" 
                          fill="#1E88E5" 
                          name="Blue Side Win Rate"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="redSide" 
                          stackId="1"
                          stroke="#E53935" 
                          fill="#E53935" 
                          name="Red Side Win Rate"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart size={20} />
                    First Objective Side Advantage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartBarChart
                        data={objectiveData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} unit="%" />
                        <YAxis type="category" dataKey="name" />
                        <Tooltip formatter={(value) => [`${value}%`, ""]} />
                        <Legend />
                        <Bar dataKey="blueSide" fill="#1E88E5" name="Blue Side" />
                        <Bar dataKey="redSide" fill="#E53935" name="Red Side" />
                      </RechartBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp size={18} className="text-blue-500" />
                    Blue Side Advantages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Blue side has significant advantages in early objective control:
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Better access to first dragon (+{objectiveData[2].blueSide - objectiveData[2].redSide}%)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Higher herald control rate (+{objectiveData[3].blueSide - objectiveData[3].redSide}%)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Faster first tower destruction (+{objectiveData[1].blueSide - objectiveData[1].redSide}%)</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp size={18} className="text-red-500" />
                    Red Side Advantages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Red side has counter-pick advantages:
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>Last pick for counter matchups</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>Better scaling comps (+12% win rate past 35 min)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>Higher Baron secure rate in late game</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Gauge size={18} className="text-purple-500" />
                    Regional Differences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Side advantage varies by region:
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>LCK: Blue +1.8% advantage</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>LPL: Blue +2.4% advantage</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>LEC: Blue +5.7% advantage</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>LCS: Blue +6.2% advantage</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="meta-trends">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp size={20} />
                      Champion Priority Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={[
                            { month: "May", top: 24, jungle: 18, mid: 22, bot: 27, support: 19 },
                            { month: "Jun", top: 25, jungle: 16, mid: 20, bot: 28, support: 21 },
                            { month: "Jul", top: 28, jungle: 15, mid: 18, bot: 26, support: 23 },
                            { month: "Aug", top: 32, jungle: 17, mid: 16, bot: 22, support: 23 },
                            { month: "Sep", top: 34, jungle: 18, mid: 15, bot: 20, support: 23 },
                            { month: "Oct", top: 36, jungle: 20, mid: 14, bot: 18, support: 22 },
                          ]}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis domain={[0, 40]} unit="%" />
                          <Tooltip formatter={(value) => [`${value}%`, ""]} />
                          <Legend />
                          <Line type="monotone" dataKey="top" stroke="#FF9800" strokeWidth={2} name="Top Lane" />
                          <Line type="monotone" dataKey="jungle" stroke="#4CAF50" strokeWidth={2} name="Jungle" />
                          <Line type="monotone" dataKey="mid" stroke="#9C27B0" strokeWidth={2} name="Mid Lane" />
                          <Line type="monotone" dataKey="bot" stroke="#2196F3" strokeWidth={2} name="Bot Lane" />
                          <Line type="monotone" dataKey="support" stroke="#F44336" strokeWidth={2} name="Support" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart size={20} />
                      Current Meta Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Top Lane Impact</span>
                          <span className="text-sm font-medium">36%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: '36%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Jungle Impact</span>
                          <span className="text-sm font-medium">20%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: '20%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Mid Lane Impact</span>
                          <span className="text-sm font-medium">14%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: '14%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Bot Lane Impact</span>
                          <span className="text-sm font-medium">18%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: '18%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Support Impact</span>
                          <span className="text-sm font-medium">22%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: '22%' }}></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        The current meta heavily favors top lane influence, with a significant shift away from
                        mid lane carries. This is a reversal from trends earlier in the year.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp size={18} className="text-amber-500" />
                    Top Lane Meta
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Top lane priority has increased significantly:
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span>Bruiser champions dominate (+12% pick rate)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span>Early game priority with TP plays</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span>Split push strategies more effective</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ArrowDownRight size={18} className="text-blue-500" />
                    ADC Role Decline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      ADC impact has decreased by 9% this quarter:
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Less focus on scaling team comps</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Early game skirmish priority</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Shorter average game times (-2.3 min)</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp size={18} className="text-red-500" />
                    Support Roaming
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Support roaming has increased in priority:
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>More time spent away from bot lane (+18%)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>Higher vision score averages (+14 per game)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>Increased mid+jungle+support coordination</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Analysis;
