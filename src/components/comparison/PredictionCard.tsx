
import React from "react";
import { AlertTriangle, Award } from "lucide-react";
import { Team } from "@/utils/models/types";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PredictionChart from "@/components/PredictionChart";

interface PredictionCardProps {
  team1: Team;
  team2: Team;
  team1WinProb: number;
  team2WinProb: number;
}

const PredictionCard = ({ team1, team2, team1WinProb, team2WinProb }: PredictionCardProps) => {
  return (
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
  );
};

export default PredictionCard;
