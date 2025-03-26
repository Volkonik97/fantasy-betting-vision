
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, Trophy, Users } from "lucide-react";
import { format } from "date-fns";
import { matches, getSideStatistics } from "@/utils/models";
import Navbar from "@/components/Navbar";
import SideAnalysis from "@/components/SideAnalysis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { formatSecondsToMinutesSeconds } from "@/utils/dataConverter";

const MatchDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const match = matches.find(m => m.id === id);
  
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  
  if (!match) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Match Not Found</h2>
          <Button onClick={() => navigate('/matches')}>
            Back to Matches
          </Button>
        </div>
      </div>
    );
  }
  
  const matchDate = new Date(match.date);
  const blueTeamStats = getSideStatistics(match.teamBlue.id);
  const redTeamStats = getSideStatistics(match.teamRed.id);
  
  const handleTeamSelect = (teamId: string) => {
    setSelectedTeam(teamId === selectedTeam ? null : teamId);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <button 
            onClick={() => navigate('/matches')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Back to Matches</span>
          </button>
          
          <h1 className="text-3xl font-bold mb-2">Match Details</h1>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{format(matchDate, "MMMM d, yyyy")} • {match.tournament}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-subtle p-6"
            >
              <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
                <div className="flex items-center gap-6">
                  <div 
                    className={`w-20 h-20 rounded-full p-2 cursor-pointer transition-all ${
                      selectedTeam === match.teamBlue.id 
                        ? "bg-lol-blue bg-opacity-20 scale-110" 
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                    onClick={() => handleTeamSelect(match.teamBlue.id)}
                  >
                    <img 
                      src={match.teamBlue.logo} 
                      alt={match.teamBlue.name} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  <div className="text-center">
                    <h2 className="text-xl font-bold">{match.teamBlue.name}</h2>
                    <span className="text-sm text-gray-500">{match.teamBlue.region}</span>
                    <div className="mt-1 text-sm font-medium text-lol-blue">
                      {(match.blueWinOdds * 100).toFixed(0)}% Win Chance
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="text-2xl font-bold text-gray-700 mb-2">VS</div>
                  {match.status === "Completed" && match.result && (
                    <div className="flex items-center gap-3 text-xl font-bold">
                      <span className={match.result.winner === match.teamBlue.id ? "text-lol-blue" : "text-gray-400"}>
                        {match.result.score[0]}
                      </span>
                      <span className="text-gray-300">-</span>
                      <span className={match.result.winner === match.teamRed.id ? "text-lol-red" : "text-gray-400"}>
                        {match.result.score[1]}
                      </span>
                    </div>
                  )}
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{format(matchDate, "h:mm a")}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <h2 className="text-xl font-bold">{match.teamRed.name}</h2>
                    <span className="text-sm text-gray-500">{match.teamRed.region}</span>
                    <div className="mt-1 text-sm font-medium text-lol-red">
                      {(match.redWinOdds * 100).toFixed(0)}% Win Chance
                    </div>
                  </div>
                  
                  <div 
                    className={`w-20 h-20 rounded-full p-2 cursor-pointer transition-all ${
                      selectedTeam === match.teamRed.id 
                        ? "bg-lol-red bg-opacity-20 scale-110" 
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                    onClick={() => handleTeamSelect(match.teamRed.id)}
                  >
                    <img 
                      src={match.teamRed.logo} 
                      alt={match.teamRed.name} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Match Prediction</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{match.teamBlue.name}</span>
                      <span>{match.teamRed.name}</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-lol-blue to-lol-red"
                        style={{ width: `${match.blueWinOdds * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-700">
                    <p>
                      <strong>{match.predictedWinner === match.teamBlue.id ? match.teamBlue.name : match.teamRed.name}</strong> is 
                      predicted to win with a {Math.round(Math.max(match.blueWinOdds, match.redWinOdds) * 100)}% chance based on 
                      recent performance and head-to-head statistics.
                    </p>
                  </div>
                </div>
              </div>
              
              {match.status === "Completed" && match.result && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Match Results</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <div>
                          <div className="text-sm text-gray-500">Winner</div>
                          <div className="font-medium">
                            {match.result.winner === match.teamBlue.id ? match.teamBlue.name : match.teamRed.name}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-500">Match Duration</div>
                          <div className="font-medium">{match.result?.duration ? formatSecondsToMinutesSeconds(parseInt(match.result.duration)) : "??:??"}</div>
                        </div>
                      </div>
                      
                      {match.result.mvp && (
                        <div className="flex items-center gap-3">
                          <Users className="w-5 h-5 text-purple-500" />
                          <div>
                            <div className="text-sm text-gray-500">MVP</div>
                            <div className="font-medium">{match.result.mvp}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Key Factors</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Form</div>
                    <div className="text-lg font-medium mb-1">
                      {match.teamBlue.winRate > match.teamRed.winRate ? match.teamBlue.name : match.teamRed.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      Recent win rate: {Math.round(Math.max(match.teamBlue.winRate, match.teamRed.winRate) * 100)}%
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Side Advantage</div>
                    <div className="text-lg font-medium mb-1">
                      {match.teamBlue.blueWinRate > match.teamRed.redWinRate ? "Blue Side" : "Red Side"}
                    </div>
                    <div className="text-sm text-gray-600">
                      {match.teamBlue.blueWinRate > match.teamRed.redWinRate 
                        ? `${match.teamBlue.name}: ${Math.round(match.teamBlue.blueWinRate * 100)}% on blue side`
                        : `${match.teamRed.name}: ${Math.round(match.teamRed.redWinRate * 100)}% on red side`
                      }
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-500 mb-1">Game Time</div>
                    <div className="text-lg font-medium mb-1">
                      {match.teamBlue.averageGameTime < match.teamRed.averageGameTime 
                        ? `${match.teamBlue.name} (Faster)` 
                        : `${match.teamRed.name} (Faster)`
                      }
                    </div>
                    <div className="text-sm text-gray-600">
                      Avg: {Math.min(match.teamBlue.averageGameTime, match.teamRed.averageGameTime).toFixed(1)} min
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Tabs defaultValue="blueTeam">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="blueTeam" className="w-1/2">Blue Side</TabsTrigger>
                  <TabsTrigger value="redTeam" className="w-1/2">Red Side</TabsTrigger>
                </TabsList>
                
                <TabsContent value="blueTeam">
                  {blueTeamStats && (
                    <SideAnalysis statistics={blueTeamStats} />
                  )}
                </TabsContent>
                
                <TabsContent value="redTeam">
                  {redTeamStats && (
                    <SideAnalysis statistics={redTeamStats} />
                  )}
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MatchDetails;
