
import React from "react";
import { Check } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface ImportStats {
  teams: number;
  players: number;
  matches: number;
  playerStats: number;
  teamStats: number;
}

interface ImportStatusDisplayProps {
  isImportComplete: boolean;
  isLoading: boolean;
  importProgress: number;
  importStats: ImportStats | null;
  progressStep: string;
  playerStatsProgress: {current: number, total: number} | null;
  teamStatsProgress: {current: number, total: number} | null;
}

const ImportStatusDisplay: React.FC<ImportStatusDisplayProps> = ({
  isImportComplete,
  isLoading,
  importProgress,
  importStats,
  progressStep,
  playerStatsProgress,
  teamStatsProgress
}) => {
  if (isImportComplete && importStats) {
    return (
      <Alert className="mt-4 bg-green-50 border border-green-200">
        <Check className="h-5 w-5 text-green-600 mr-2" />
        <AlertTitle className="text-green-800">Importation terminée !</AlertTitle>
        <AlertDescription>
          <ul className="mt-2 space-y-1 text-sm text-green-700">
            <li>• {importStats.teams} équipes importées</li>
            <li>• {importStats.players} joueurs importés</li>
            <li>• {importStats.matches} matchs importés</li>
            <li>• {importStats.playerStats} statistiques de joueurs importées</li>
            <li>• {importStats.teamStats} statistiques d'équipes importées</li>
          </ul>
        </AlertDescription>
      </Alert>
    );
  }
  
  if (isLoading) {
    return (
      <div className="mt-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-500">{progressStep}</span>
          <span className="text-sm font-medium">{Math.round(importProgress)}%</span>
        </div>
        <Progress value={importProgress} className="h-2" />
        
        {playerStatsProgress && (
          <div className="mt-3 text-xs text-gray-500">
            Enregistrement des statistiques de joueurs: {playerStatsProgress.current} sur {playerStatsProgress.total}
            <Progress 
              value={(playerStatsProgress.current / playerStatsProgress.total) * 100} 
              className="h-1 mt-1" 
            />
          </div>
        )}
        
        {teamStatsProgress && (
          <div className="mt-3 text-xs text-gray-500">
            Enregistrement des statistiques d'équipes: {teamStatsProgress.current} sur {teamStatsProgress.total}
            <Progress 
              value={(teamStatsProgress.current / teamStatsProgress.total) * 100} 
              className="h-1 mt-1" 
            />
          </div>
        )}
      </div>
    );
  }
  
  return null;
};

export default ImportStatusDisplay;
