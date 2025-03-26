
import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  PieChart, 
  BarChart,
  ArrowUpRight, 
  ArrowDownRight, 
  Clock,
  Calendar
} from "lucide-react";
import { teams, matches } from "@/utils/mockData";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import MatchCard from "@/components/MatchCard";
import PredictionChart from "@/components/PredictionChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Predictions = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  
  // Filter matches
  const upcomingMatches = matches.filter(match => match.status === "Scheduled");
  
  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  // Filtered matches
  const filteredMatches = upcomingMatches.filter(match => {
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        match.teamBlue.name.toLowerCase().includes(searchLower) ||
        match.teamRed.name.toLowerCase().includes(searchLower) ||
        match.tournament.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });
  
  // Important match (for featured prediction)
  const featuredMatch = matches.find(match => match.id === "match-001") || matches[0];
  
  // Value bet detection - identify matches where our prediction differs significantly from implied odds
  const valueBets = matches
    .filter(match => match.status === "Scheduled")
    .map(match => {
      // Calculate the difference between our prediction and the implied odds
      const blueImpliedOdds = 1 / match.odds.blue;
      const redImpliedOdds = 1 / match.odds.red;
      
      // Normalize implied odds to percentages
      const totalImplied = blueImpliedOdds + redImpliedOdds;
      const blueImpliedProb = (blueImpliedOdds / totalImplied) * 100;
      const redImpliedProb = (redImpliedOdds / totalImplied) * 100;
      
      // Compare with our model's predictions
      const blueModelProb = match.blueWinOdds * 100;
      const redModelProb = match.redWinOdds * 100;
      
      const blueDiff = blueModelProb - blueImpliedProb;
      const redDiff = redModelProb - redImpliedProb;
      
      return {
        ...match,
        valueBlueSide: blueDiff,
        valueRedSide: redDiff
      };
    })
    .sort((a, b) => Math.max(Math.abs(b.valueBlueSide), Math.abs(b.valueRedSide)) - 
      Math.max(Math.abs(a.valueBlueSide), Math.abs(a.valueRedSide)))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Match Predictions</h1>
          <p className="text-gray-600">
            Advanced statistical predictions for upcoming League of Legends matches
          </p>
        </div>
        
        <div className="mb-6">
          <SearchBar onSearch={handleSearch} value={searchQuery} />
        </div>
        
        <Tabs defaultValue="upcoming" className="mb-8">
          <TabsList className="mb-4">
            <TabsTrigger value="upcoming">Upcoming Matches</TabsTrigger>
            <TabsTrigger value="value-bets">Value Bets</TabsTrigger>
            <TabsTrigger value="featured">Featured Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-medium text-gray-500">Filter by:</span>
                <Select
                  value={selectedFilter}
                  onValueChange={setSelectedFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Tournaments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tournaments</SelectItem>
                    <SelectItem value="worlds">Worlds 2023</SelectItem>
                    <SelectItem value="lck">LCK</SelectItem>
                    <SelectItem value="lpl">LPL</SelectItem>
                    <SelectItem value="lec">LEC</SelectItem>
                    <SelectItem value="lcs">LCS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredMatches.length > 0 ? (
                  filteredMatches.map((match) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MatchCard match={match} />
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-2 p-8 text-center">
                    <p className="text-gray-500">No matches found matching your criteria.</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="value-bets">
            <div className="mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-blue-800 mb-2">What are Value Bets?</h3>
                <p className="text-sm text-gray-700">
                  Value bets occur when our prediction model identifies a significant discrepancy between 
                  our calculated win probability and the implied probability from bookmaker odds. These
                  represent potential betting opportunities with positive expected value.
                </p>
              </div>
              
              <div className="space-y-6">
                {valueBets.map((match) => {
                  const isBlueBetterValue = Math.abs(match.valueBlueSide) > Math.abs(match.valueRedSide);
                  const valueTeam = isBlueBetterValue ? match.teamBlue : match.teamRed;
                  const valuePercent = isBlueBetterValue ? match.valueBlueSide : match.valueRedSide;
                  const valuePositive = valuePercent > 0;
                  
                  return (
                    <Card key={match.id} className="overflow-hidden">
                      <div className={`h-1 ${valuePositive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="md:w-1/2">
                            <div className="flex items-center gap-2 mb-4">
                              <Calendar size={16} className="text-gray-400" />
                              <span className="text-sm text-gray-500">
                                {new Date(match.date).toLocaleDateString()} - {match.tournament}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-white border border-gray-200 p-2 flex items-center justify-center">
                                  <img
                                    src={valueTeam.logo}
                                    alt={valueTeam.name}
                                    className="w-8 h-8 object-contain"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = "/placeholder.svg";
                                    }}
                                  />
                                </div>
                                <div>
                                  <h3 className="font-medium">{valueTeam.name}</h3>
                                  <p className="text-xs text-gray-500">{valueTeam.region}</p>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className={`text-lg font-bold ${valuePositive ? 'text-green-600' : 'text-red-600'}`}>
                                  {valuePositive ? '+' : ''}{valuePercent.toFixed(1)}%
                                </div>
                                <p className="text-xs text-gray-500">Value differential</p>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Model prediction:</span>
                                <span className="font-medium">
                                  {isBlueBetterValue 
                                    ? `${(match.blueWinOdds * 100).toFixed(1)}%` 
                                    : `${(match.redWinOdds * 100).toFixed(1)}%`}
                                </span>
                              </div>
                              
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Implied by odds:</span>
                                <span className="font-medium">
                                  {isBlueBetterValue 
                                    ? `${(100 - match.valueBlueSide).toFixed(1)}%` 
                                    : `${(100 - match.valueRedSide).toFixed(1)}%`}
                                </span>
                              </div>
                              
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Decimal odds:</span>
                                <span className="font-medium">
                                  {isBlueBetterValue 
                                    ? match.odds.blue.toFixed(2) 
                                    : match.odds.red.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="md:w-1/2 flex flex-col">
                            <div className="bg-gray-50 p-4 rounded-lg flex-grow">
                              <h4 className="font-medium mb-2">Analysis</h4>
                              <p className="text-sm text-gray-600 mb-4">
                                Our model suggests {valueTeam.name} has a 
                                {isBlueBetterValue 
                                  ? ` ${(match.blueWinOdds * 100).toFixed(1)}%` 
                                  : ` ${(match.redWinOdds * 100).toFixed(1)}%`} 
                                chance to win, but the betting market implies only
                                {isBlueBetterValue 
                                  ? ` ${(100 - match.valueBlueSide).toFixed(1)}%` 
                                  : ` ${(100 - match.valueRedSide).toFixed(1)}%`}.
                              </p>
                              
                              <div className="text-sm bg-green-50 border border-green-100 rounded p-3 text-green-800">
                                <div className="font-medium mb-1">Bet recommendation:</div>
                                {valuePositive ? (
                                  <p>Back {valueTeam.name} to win at odds of {isBlueBetterValue 
                                    ? match.odds.blue.toFixed(2) 
                                    : match.odds.red.toFixed(2)}</p>
                                ) : (
                                  <p>Lay {valueTeam.name} (bet against) at current odds</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="featured">
            {featuredMatch && (
              <div className="mb-8">
                <div className="bg-white rounded-xl border border-gray-100 shadow-subtle p-6 mb-8">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="md:w-2/3">
                      <div className="flex items-center gap-2 mb-4">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {new Date(featuredMatch.date).toLocaleDateString()} - {featuredMatch.tournament}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-white border border-gray-200 p-2 flex items-center justify-center">
                            <img
                              src={featuredMatch.teamBlue.logo}
                              alt={featuredMatch.teamBlue.name}
                              className="w-10 h-10 object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder.svg";
                              }}
                            />
                          </div>
                          <div>
                            <h3 className="text-xl font-medium">{featuredMatch.teamBlue.name}</h3>
                            <p className="text-sm text-gray-500">{featuredMatch.teamBlue.region}</p>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <span className="text-xl font-bold text-gray-400">VS</span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <h3 className="text-xl font-medium">{featuredMatch.teamRed.name}</h3>
                            <p className="text-sm text-gray-500">{featuredMatch.teamRed.region}</p>
                          </div>
                          <div className="w-16 h-16 rounded-full bg-white border border-gray-200 p-2 flex items-center justify-center">
                            <img
                              src={featuredMatch.teamRed.logo}
                              alt={featuredMatch.teamRed.name}
                              className="w-10 h-10 object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder.svg";
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                          <p className="text-sm text-gray-500 mb-1">Blue Side Win %</p>
                          <p className="text-xl font-bold text-blue-600">
                            {(featuredMatch.blueWinOdds * 100).toFixed(1)}%
                          </p>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                          <p className="text-sm text-gray-500 mb-1">Red Side Win %</p>
                          <p className="text-xl font-bold text-red-600">
                            {(featuredMatch.redWinOdds * 100).toFixed(1)}%
                          </p>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                          <p className="text-sm text-gray-500 mb-1">Blue Side Odds</p>
                          <p className="text-xl font-bold">{featuredMatch.odds.blue.toFixed(2)}</p>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                          <p className="text-sm text-gray-500 mb-1">Red Side Odds</p>
                          <p className="text-xl font-bold">{featuredMatch.odds.red.toFixed(2)}</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-3">Key Match Factors</h4>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm">{featuredMatch.teamBlue.name} Form</span>
                              <span className="text-sm font-medium">75%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: '75%' }}></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm">{featuredMatch.teamRed.name} Form</span>
                              <span className="text-sm font-medium">68%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-red-500 rounded-full" style={{ width: '68%' }}></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm">Blue Side Advantage</span>
                              <span className="text-sm font-medium">+4.5%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-purple-500 rounded-full" style={{ width: '54.5%' }}></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm">Head-to-Head</span>
                              <span className="text-sm font-medium">3-2</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: '60%' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:w-1/3">
                      <PredictionChart 
                        blueWinRate={featuredMatch.blueWinOdds * 100} 
                        redWinRate={featuredMatch.redWinOdds * 100} 
                        teamBlueName={featuredMatch.teamBlue.name} 
                        teamRedName={featuredMatch.teamRed.name} 
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp size={18} className="text-blue-500" />
                        {featuredMatch.teamBlue.name} Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 mt-1.5 bg-blue-500 rounded-full"></div>
                          <span>Higher early game objective control rate (+12%)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 mt-1.5 bg-blue-500 rounded-full"></div>
                          <span>Superior vision control (28% higher vision score)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 mt-1.5 bg-blue-500 rounded-full"></div>
                          <span>Strong mid-jungle synergy with higher roaming %</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 mt-1.5 bg-blue-500 rounded-full"></div>
                          <span>Better teamfight coordination (72% teamfight win rate)</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp size={18} className="text-red-500" />
                        {featuredMatch.teamRed.name} Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 mt-1.5 bg-red-500 rounded-full"></div>
                          <span>Stronger late game scaling (win rate > 35 min: 65%)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 mt-1.5 bg-red-500 rounded-full"></div>
                          <span>Better baron control (68% secure rate)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 mt-1.5 bg-red-500 rounded-full"></div>
                          <span>Strong side lane management (+15 CS/min)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 mt-1.5 bg-red-500 rounded-full"></div>
                          <span>Excellent draft flexibility with larger champion pool</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <PieChart size={18} className="text-purple-500" />
                        Key Matchups
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 mt-1.5 bg-purple-500 rounded-full"></div>
                          <span><span className="font-medium">Top lane:</span> Bruiser vs Bruiser matchup favors blue side</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 mt-1.5 bg-purple-500 rounded-full"></div>
                          <span><span className="font-medium">Jungle:</span> Early pathing will determine dragon control</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 mt-1.5 bg-purple-500 rounded-full"></div>
                          <span><span className="font-medium">Mid lane:</span> Red side has champion pool advantage</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 mt-1.5 bg-purple-500 rounded-full"></div>
                          <span><span className="font-medium">Bot lane:</span> Blue side has stronger early game</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart size={20} />
                      Performance Comparison
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartBarChart
                          data={[
                            { name: 'Win Rate', blue: 56, red: 58 },
                            { name: 'First Blood %', blue: 62, red: 48 },
                            { name: 'First Dragon %', blue: 68, red: 45 },
                            { name: 'First Baron %', blue: 52, red: 58 },
                            { name: 'CS Difference @15', blue: 12, red: 8 },
                            { name: 'Gold Difference @15', blue: 850, red: 620 },
                          ]}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis type="category" dataKey="name" />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="blue" fill="#1E88E5" name={featuredMatch.teamBlue.name} />
                          <Bar dataKey="red" fill="#E53935" name={featuredMatch.teamRed.name} />
                        </RechartBarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Predictions;
