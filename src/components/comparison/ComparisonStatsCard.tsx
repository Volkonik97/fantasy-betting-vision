
import React from "react";
import { Scale, Award } from "lucide-react";
import { Team } from "@/utils/models/types";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
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
import { formatTime } from "@/utils/formatters/timeFormatter";

interface ComparisonStatsCardProps {
  team1: Team;
  team2: Team;
  comparisonData: any[];
}

const ComparisonStatsCard = ({ team1, team2, comparisonData }: ComparisonStatsCardProps) => {
  
  const getAdvantagesFactor = (teamA: Team, teamB: Team) => {
    const factors = [];
    
    if (teamA.winRate > teamB.winRate) {
      factors.push(`${teamA.name} a un meilleur taux de victoire (${Math.round(teamA.winRate * 100)}% vs ${Math.round(teamB.winRate * 100)}%)`);
    }
    
    if (teamA.blueWinRate > teamB.blueWinRate) {
      factors.push(`${teamA.name} performe mieux du côté bleu (${Math.round(teamA.blueWinRate * 100)}% vs ${Math.round(teamB.blueWinRate * 100)}%)`);
    }
    
    if (teamA.redWinRate > teamB.redWinRate) {
      factors.push(`${teamA.name} performe mieux du côté rouge (${Math.round(teamA.redWinRate * 100)}% vs ${Math.round(teamB.redWinRate * 100)}%)`);
    }
    
    if (teamA.averageGameTime < teamB.averageGameTime) {
      factors.push(`${teamA.name} a des parties plus courtes (${formatTime(teamA.averageGameTime)} vs ${formatTime(teamB.averageGameTime)})`);
    }
    
    return factors;
  };

  return (
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
  );
};

export default ComparisonStatsCard;
