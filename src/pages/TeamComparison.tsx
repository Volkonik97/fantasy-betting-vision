
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GitCompare, ChevronRight, Scale, AlertTriangle, Award, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import TeamStatistics from "@/components/TeamStatistics";
import PredictionChart from "@/components/PredictionChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { getTeams, getSideStatistics } from "@/utils/csvService";
import { Team } from "@/utils/mockData";

const TeamComparison = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [team1Id, setTeam1Id] = useState<string>("");
  const [team2Id, setTeam2Id] = useState<string>("");
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [team1WinProb, setTeam1WinProb] = useState(50);
  const [team2WinProb, setTeam2WinProb] = useState(50);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        setIsLoading(true);
        const loadedTeams = await getTeams();
        setTeams(loadedTeams);
      } catch (error) {
        console.error("Erreur lors du chargement des équipes:", error);
        toast.error("Erreur lors du chargement des équipes");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTeams();
  }, []);

  const team1 = teams.find(t => t.id === team1Id);
  const team2 = teams.find(t => t.id === team2Id);

  // Generate comparison data when teams are selected
  useEffect(() => {
    if (team1 && team2) {
      // Calculate win probability based on win rates and other factors
      const team1Strength = team1.winRate * 0.5 + team1.blueWinRate * 0.3 + (1 - team2.redWinRate) * 0.2;
      const team2Strength = team2.winRate * 0.5 + team2.redWinRate * 0.3 + (1 - team1.blueWinRate) * 0.2;
      
      const totalStrength = team1Strength + team2Strength;
      const team1Probability = Math.round((team1Strength / totalStrength) * 100);
      const team2Probability = 100 - team1Probability;
      
      setTeam1WinProb(team1Probability);
      setTeam2WinProb(team2Probability);
      
      // Generate comparison data for charts
      const newComparisonData = [
        { stat: "Win Rate", team1: Math.round(team1.winRate * 100), team2: Math.round(team2.winRate * 100) },
        { stat: "Blue Side Win", team1: Math.round(team1.blueWinRate * 100), team2: Math.round(team2.blueWinRate * 100) },
        { stat: "Red Side Win", team1: Math.round(team1.redWinRate * 100), team2: Math.round(team2.redWinRate * 100) },
        { stat: "Avg Game (min)", team1: team1.averageGameTime, team2: team2.averageGameTime },
      ];
      
      setComparisonData(newComparisonData);
      
      toast(`Comparaison entre ${team1.name} et ${team2.name} générée`, {
        description: `Probabilité de victoire: ${team1.name} (${team1Probability}%) vs ${team2.name} (${team2Probability}%)`,
      });
    } else {
      setComparisonData(null);
    }
  }, [team1Id, team2Id]);

  const handleCompare = () => {
    if (!team1Id || !team2Id) {
      toast("Veuillez sélectionner deux équipes pour comparer", {
        description: "Les deux équipes doivent être sélectionnées pour générer une prédiction.",
      });
      return;
    }
    
    if (team1Id === team2Id) {
      toast("Veuillez sélectionner deux équipes différentes", {
        description: "Vous ne pouvez pas comparer une équipe avec elle-même.",
      });
      return;
    }
  };

  const getAdvantagesFactor = (team1: any, team2: any) => {
    const factors = [];
    
    if (team1.winRate > team2.winRate) {
      factors.push(`${team1.name} a un meilleur taux de victoire (${Math.round(team1.winRate * 100)}% vs ${Math.round(team2.winRate * 100)}%)`);
    }
    
    if (team1.blueWinRate > team2.blueWinRate) {
      factors.push(`${team1.name} performe mieux du côté bleu (${Math.round(team1.blueWinRate * 100)}% vs ${Math.round(team2.blueWinRate * 100)}%)`);
    }
    
    if (team1.redWinRate > team2.redWinRate) {
      factors.push(`${team1.name} performe mieux du côté rouge (${Math.round(team1.redWinRate * 100)}% vs ${Math.round(team2.redWinRate * 100)}%)`);
    }
    
    if (team1.averageGameTime < team2.averageGameTime) {
      factors.push(`${team1.name} a des parties plus courtes (${team1.averageGameTime} min vs ${team2.averageGameTime} min)`);
    }
    
    return factors;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Comparaison d'Équipes</h1>
          <p className="text-gray-600">
            Comparez deux équipes pour obtenir des prédictions sur un match hypothétique
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lol-blue"></div>
          </div>
        ) : (
          <>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitCompare className="h-5 w-5" />
                  Sélectionner les équipes à comparer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
                  <div className="md:col-span-3">
                    <Select value={team1Id} onValueChange={setTeam1Id}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner la première équipe" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            <div className="flex items-center gap-2">
                              <img src={team.logo} alt={team.name} className="w-5 h-5 object-contain" />
                              <span>{team.name}</span>
                              <span className="text-xs text-gray-500">({team.region})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-center">
                    <div className="bg-gray-100 rounded-full p-2">
                      <ChevronRight className="h-5 w-5 text-gray-500" />
                    </div>
                  </div>
                  
                  <div className="md:col-span-3">
                    <Select value={team2Id} onValueChange={setTeam2Id}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner la deuxième équipe" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            <div className="flex items-center gap-2">
                              <img src={team.logo} alt={team.name} className="w-5 h-5 object-contain" />
                              <span>{team.name}</span>
                              <span className="text-xs text-gray-500">({team.region})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-center">
                  <Button onClick={handleCompare} disabled={!team1Id || !team2Id || team1Id === team2Id}>
                    Comparer les équipes
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {comparisonData && team1 && team2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Scale className="h-5 w-5" />
                          Comparaison statistique
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={comparisonData}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                              layout="vertical"
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" />
                              <YAxis dataKey="stat" type="category" />
                              <Tooltip />
                              <Legend />
                              <Bar name={team1.name} dataKey="team1" fill="#0AC8B9" />
                              <Bar name={team2.name} dataKey="team2" fill="#E84057" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        
                        <div className="mt-8 space-y-4">
                          <h3 className="text-lg font-medium">Facteurs clés</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <Award className="h-4 w-4 text-blue-500" />
                                Avantages pour {team1.name}
                              </h4>
                              <ul className="space-y-2">
                                {getAdvantagesFactor(team1, team2).map((factor, index) => (
                                  <li key={index} className="flex items-start gap-2 text-sm">
                                    <div className="w-1.5 h-1.5 mt-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                                    <span>{factor}</span>
                                  </li>
                                ))}
                                {getAdvantagesFactor(team1, team2).length === 0 && (
                                  <li className="text-sm text-gray-500">Aucun avantage significatif détecté</li>
                                )}
                              </ul>
                            </div>
                            
                            <div>
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <Award className="h-4 w-4 text-red-500" />
                                Avantages pour {team2.name}
                              </h4>
                              <ul className="space-y-2">
                                {getAdvantagesFactor(team2, team1).map((factor, index) => (
                                  <li key={index} className="flex items-start gap-2 text-sm">
                                    <div className="w-1.5 h-1.5 mt-1.5 bg-red-500 rounded-full flex-shrink-0"></div>
                                    <span>{factor}</span>
                                  </li>
                                ))}
                                {getAdvantagesFactor(team2, team1).length === 0 && (
                                  <li className="text-sm text-gray-500">Aucun avantage significatif détecté</li>
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle>Prédiction</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <PredictionChart
                          blueWinRate={team1WinProb}
                          redWinRate={team2WinProb}
                          teamBlueName={team1.name}
                          teamRedName={team2.name}
                        />
                        
                        <div className="mt-6 bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium mb-2">Analyse</h4>
                          <p className="text-sm text-gray-700 mb-4">
                            Basé sur les statistiques actuelles, {team1WinProb > team2WinProb ? team1.name : team2.name} a 
                            {team1WinProb > team2WinProb ? ` ${team1WinProb}%` : ` ${team2WinProb}%`} de chances de 
                            gagner un match hypothétique contre 
                            {team1WinProb > team2WinProb ? ` ${team2.name}` : ` ${team1.name}`}.
                          </p>
                          
                          {Math.abs(team1WinProb - team2WinProb) < 10 && (
                            <div className="flex items-start gap-2 text-sm bg-yellow-50 border border-yellow-100 rounded p-3 text-yellow-800">
                              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                              <div>
                                <p className="font-medium">Match très serré</p>
                                <p>La différence entre les deux équipes est minime, le résultat pourrait être déterminé par des facteurs externes comme la méta actuelle ou la forme du jour.</p>
                              </div>
                            </div>
                          )}
                          
                          {Math.abs(team1WinProb - team2WinProb) >= 20 && (
                            <div className="flex items-start gap-2 text-sm bg-blue-50 border border-blue-100 rounded p-3 text-blue-800">
                              <Award className="h-5 w-5 flex-shrink-0" />
                              <div>
                                <p className="font-medium">Favori clair</p>
                                <p>{team1WinProb > team2WinProb ? team1.name : team2.name} est fortement favorisé dans cette confrontation avec un avantage statistique significatif.</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Button variant="outline" className="w-full" onClick={() => window.location.href = `/teams/${team1Id}`}>
                        Voir {team1.name}
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => window.location.href = `/teams/${team2Id}`}>
                        Voir {team2.name}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <TeamStatistics team={team1} />
                  </div>
                  <div>
                    <TeamStatistics team={team2} />
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default TeamComparison;
