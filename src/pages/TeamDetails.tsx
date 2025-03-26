
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, Percent, Clock, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Team, Match, Player } from "@/utils/mockData";
import Navbar from "@/components/Navbar";
import PlayerCard from "@/components/PlayerCard";
import TeamStatistics from "@/components/TeamStatistics";
import SideAnalysis from "@/components/SideAnalysis";
import PredictionChart from "@/components/PredictionChart";
import { supabase } from "@/integrations/supabase/client";
import { getTeams, getMatches, getSideStatistics } from "@/utils/csvService";

const TeamDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [teamMatches, setTeamMatches] = useState<Match[]>([]);
  const [sideStats, setSideStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadTeamData = async () => {
      try {
        setIsLoading(true);
        
        // Charger l'équipe depuis Supabase
        const teams = await getTeams();
        const foundTeam = teams.find(t => t.id === id);
        
        if (!foundTeam) {
          setError("Équipe non trouvée");
          setIsLoading(false);
          return;
        }
        
        setTeam(foundTeam);
        
        // Charger les matchs associés à cette équipe
        const matches = await getMatches();
        const filteredMatches = matches.filter(
          match => match.teamBlue.id === id || match.teamRed.id === id
        );
        setTeamMatches(filteredMatches);
        
        // Charger les statistiques par côté
        const stats = await getSideStatistics(foundTeam.id);
        setSideStats(stats);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Erreur lors du chargement des données");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      loadTeamData();
    }
  }, [id]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lol-blue"></div>
      </div>
    );
  }
  
  if (error || !team) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{error || "Équipe non trouvée"}</h2>
          <Link to="/teams" className="text-lol-blue hover:underline">
            Retour à la liste des équipes
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <Link
          to="/teams"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-lol-blue transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          <span>Retour aux équipes</span>
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-white rounded-xl border border-gray-100 shadow-subtle p-6 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                <img 
                  src={team.logo} 
                  alt={`${team.name} logo`} 
                  className="w-16 h-16 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }}
                />
              </div>
              
              <div>
                <h1 className="text-3xl font-bold mb-1">{team.name}</h1>
                <p className="text-gray-600">{team.region}</p>
              </div>
              
              <div className="ml-auto grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="flex justify-center mb-1">
                    <Percent size={18} className="text-lol-blue" />
                  </div>
                  <p className="text-2xl font-bold">{(team.winRate * 100).toFixed(0)}%</p>
                  <p className="text-xs text-gray-500">Win Rate</p>
                </div>
                
                <div className="text-center">
                  <div className="flex justify-center mb-1">
                    <Clock size={18} className="text-lol-blue" />
                  </div>
                  <p className="text-2xl font-bold">{team.averageGameTime.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">Avg. Game (min)</p>
                </div>
                
                <div className="text-center">
                  <div className="flex justify-center mb-1">
                    <TrendingUp size={18} className="text-lol-blue" />
                  </div>
                  <p className="text-2xl font-bold">{(team.blueWinRate * 100).toFixed(0)}%</p>
                  <p className="text-xs text-gray-500">Blue Side Wins</p>
                </div>
                
                <div className="text-center">
                  <div className="flex justify-center mb-1">
                    <TrendingUp size={18} className="text-lol-blue" />
                  </div>
                  <p className="text-2xl font-bold">{(team.redWinRate * 100).toFixed(0)}%</p>
                  <p className="text-xs text-gray-500">Red Side Wins</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <TeamStatistics team={team} />
          </div>
          
          <div>
            <PredictionChart 
              blueWinRate={team.blueWinRate * 100} 
              redWinRate={team.redWinRate * 100} 
              teamBlueName="Blue Side" 
              teamRedName="Red Side" 
            />
          </div>
        </div>
        
        {sideStats && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Side Performance Analysis</h2>
            <SideAnalysis statistics={sideStats} />
          </div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-4">Roster</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {team.players.map(player => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        </motion.div>
        
        {teamMatches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="mt-8"
          >
            <h2 className="text-2xl font-bold mb-4">Recent Matches</h2>
            <div className="bg-white rounded-xl border border-gray-100 shadow-subtle overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Tournament</th>
                    <th className="px-4 py-3 text-left">Opponent</th>
                    <th className="px-4 py-3 text-left">Result</th>
                    <th className="px-4 py-3 text-left">Prediction</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMatches.map(match => {
                    const isBlue = match.teamBlue.id === team.id;
                    const opponent = isBlue ? match.teamRed : match.teamBlue;
                    const result = match.result 
                      ? (isBlue 
                          ? (match.result.winner === team.id ? 'Win' : 'Loss')
                          : (match.result.winner === team.id ? 'Win' : 'Loss'))
                      : '-';
                    const predictionAccurate = match.result 
                      ? match.predictedWinner === match.result.winner 
                      : null;
                    
                    return (
                      <tr key={match.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {new Date(match.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">{match.tournament}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                              <img 
                                src={opponent.logo} 
                                alt={`${opponent.name} logo`} 
                                className="w-4 h-4 object-contain"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/placeholder.svg";
                                }}
                              />
                            </div>
                            <span>{opponent.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-medium ${
                            result === 'Win' ? 'text-green-600' : 
                            result === 'Loss' ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {result}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {match.status === 'Completed' ? (
                            <span className={`text-xs px-2 py-1 rounded ${
                              predictionAccurate ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {predictionAccurate ? 'Correct' : 'Incorrect'}
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                              {match.predictedWinner === team.id ? 'Win' : 'Loss'} 
                              ({isBlue 
                                ? Math.round(match.blueWinOdds * 100)
                                : Math.round(match.redWinOdds * 100)}%)
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default TeamDetails;
