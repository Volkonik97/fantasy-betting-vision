
import React, { useState, useEffect } from "react";
import { loadFromGoogleSheets, hasDatabaseData } from "@/utils/csvService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import ImportStatusDisplay from "./csv/ImportStatusDisplay";
import DataImportForm from "./csv/DataImportForm";
import DataFormatInfo from "./csv/DataFormatInfo";

interface CsvDataManagerProps {
  onDataImported?: () => void;
}

interface ImportStats {
  teams: number;
  players: number;
  matches: number;
  playerStats: number;
  teamStats: number;
}

const CsvDataManager = ({ onDataImported }: CsvDataManagerProps) => {
  const [sheetsUrl, setSheetsUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [isImportComplete, setIsImportComplete] = useState(false);
  const [hasDataInDb, setHasDataInDb] = useState(false);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const [deleteExisting, setDeleteExisting] = useState(true);
  const [progressStep, setProgressStep] = useState<string>("");
  const [playerStatsProgress, setPlayerStatsProgress] = useState<{current: number, total: number} | null>(null);
  const [teamStatsProgress, setTeamStatsProgress] = useState<{current: number, total: number} | null>(null);

  useEffect(() => {
    const checkData = async () => {
      const hasData = await hasDatabaseData();
      setHasDataInDb(hasData);
    };
    
    checkData();
  }, []);

  const handleSheetImport = async () => {
    if (!sheetsUrl) {
      toast.error("Veuillez entrer une URL Google Sheets valide");
      return;
    }

    try {
      setIsLoading(true);
      setImportProgress(10);
      setIsImportComplete(false);
      setImportStats(null);
      setPlayerStatsProgress(null);
      setTeamStatsProgress(null);
      console.log("Début de l'importation depuis Google Sheets:", sheetsUrl);
      
      const progressCallback = (step: string, progress: number) => {
        console.log(`Import progress: ${step} - ${progress}%`);
        setProgressStep(step);
        setImportProgress(progress);
        
        // Vérifier si c'est la progression des statistiques de joueurs
        if (step.includes("statistiques des joueurs") && step.includes("sur")) {
          const match = step.match(/\((\d+) sur (\d+)\)/);
          if (match && match.length === 3) {
            setPlayerStatsProgress({
              current: parseInt(match[1], 10),
              total: parseInt(match[2], 10)
            });
          }
        } 
        // Vérifier si c'est la progression des statistiques d'équipes
        else if (step.includes("statistiques des équipes") && step.includes("sur")) {
          const match = step.match(/\((\d+) sur (\d+)\)/);
          if (match && match.length === 3) {
            setTeamStatsProgress({
              current: parseInt(match[1], 10),
              total: parseInt(match[2], 10)
            });
          }
        } else {
          // Si ce n'est ni l'un ni l'autre, réinitialiser les progressions spécifiques
          if (!step.includes("statistiques des joueurs")) {
            setPlayerStatsProgress(null);
          }
          if (!step.includes("statistiques des équipes")) {
            setTeamStatsProgress(null);
          }
        }
      };
      
      const result = await loadFromGoogleSheets(sheetsUrl, deleteExisting, progressCallback);
      
      if (result === false) {
        setImportProgress(0);
        setIsImportComplete(false);
        setIsLoading(false);
        return;
      }
      
      setImportProgress(100);
      setIsImportComplete(true);
      setProgressStep("Importation terminée");
      setImportStats({
        teams: result.teams.length,
        players: result.players.length,
        matches: result.matches.length,
        playerStats: result.playerMatchStats?.length || 0,
        teamStats: result.teamMatchStats?.length || 0
      });
      
      console.log("Résultat de l'importation:", {
        teams: result.teams.length,
        players: result.players.length, 
        matches: result.matches.length,
        playerStats: result.playerMatchStats?.length || 0,
        teamStats: result.teamMatchStats?.length || 0
      });
      
      toast.success(`Données chargées avec succès depuis Google Sheets: ${result.teams.length} équipes, ${result.players.length} joueurs, ${result.matches.length} matchs, ${result.playerMatchStats?.length || 0} statistiques de joueurs, ${result.teamMatchStats?.length || 0} statistiques d'équipes`);
      
      if (onDataImported) {
        await onDataImported();
      }
      
      setHasDataInDb(true);
      
      // No redirection - user stays on the same page
    } catch (error) {
      console.error("Erreur de chargement:", error);
      toast.error(`Erreur lors du chargement des données depuis Google Sheets: ${error instanceof Error ? error.message : String(error)}`);
      setImportProgress(0);
      setIsImportComplete(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Importation de données</CardTitle>
        <CardDescription>
          Importez vos données statistiques via Google Sheets
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <DataImportForm 
          sheetsUrl={sheetsUrl}
          setSheetsUrl={setSheetsUrl}
          deleteExisting={deleteExisting}
          setDeleteExisting={setDeleteExisting}
          hasDataInDb={hasDataInDb}
          isLoading={isLoading}
          handleSheetImport={handleSheetImport}
        />
        
        <DataFormatInfo />
        
        <ImportStatusDisplay 
          isImportComplete={isImportComplete}
          isLoading={isLoading}
          importProgress={importProgress}
          importStats={importStats}
          progressStep={progressStep}
          playerStatsProgress={playerStatsProgress}
          teamStatsProgress={teamStatsProgress}
        />
      </CardContent>
    </Card>
  );
};

export default CsvDataManager;
