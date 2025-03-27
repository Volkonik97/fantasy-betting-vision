
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { getTeams } from "@/utils/csvService";
import { Team } from "@/utils/models/types";
import { formatTime } from "@/utils/formatters/timeFormatter";
import TeamSelectionCard from "@/components/comparison/TeamSelectionCard";
import TeamComparisonResult from "@/components/comparison/TeamComparisonResult";

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
    // Validation is handled in the TeamSelectionCard component
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
            <TeamSelectionCard 
              teams={teams}
              team1Id={team1Id}
              team2Id={team2Id}
              onTeam1Change={setTeam1Id}
              onTeam2Change={setTeam2Id}
              onCompare={handleCompare}
              isLoading={isLoading}
            />
            
            {comparisonData && team1 && team2 && (
              <TeamComparisonResult 
                team1={team1}
                team2={team2}
                team1WinProb={team1WinProb}
                team2WinProb={team2WinProb}
                comparisonData={comparisonData}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default TeamComparison;
