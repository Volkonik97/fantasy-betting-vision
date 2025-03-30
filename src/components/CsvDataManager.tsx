
import React, { useState, useEffect } from "react";
import { loadFromGoogleSheets, hasDatabaseData } from "@/utils/csvService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link, Database, AlertCircle, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

  const renderImportStatus = () => {
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

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Importation de données</CardTitle>
        <CardDescription>
          Importez vos données statistiques via Google Sheets
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {hasDataInDb && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center text-blue-700">
              <Database className="mr-2 h-5 w-5" />
              <p className="text-sm font-medium">
                Les données sont stockées dans Supabase.
              </p>
            </div>
            
            <div className="flex items-center mt-2">
              <Checkbox 
                id="deleteExisting" 
                checked={deleteExisting} 
                onCheckedChange={(checked) => setDeleteExisting(checked as boolean)}
                className="mr-2"
              />
              <label htmlFor="deleteExisting" className="text-sm cursor-pointer text-blue-700">
                Supprimer les données existantes avant l'importation
              </label>
            </div>
          </div>
        )}
        
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-2">URL Google Sheets</h3>
          <p className="text-sm text-gray-500 mb-4">
            Entrez l'URL d'un document Google Sheets contenant les données au format Oracle's Elixir
          </p>
          <div className="space-y-4">
            <Input
              type="url"
              placeholder="https://docs.google.com/spreadsheets/d/..."
              value={sheetsUrl}
              onChange={(e) => setSheetsUrl(e.target.value)}
            />
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Conseil:</strong> Pour les données au format Oracle's Elixir avec toutes les colonnes 
                (gameid, league, year, split, playername, teamname, etc.), l'importation Google Sheets 
                offre la meilleure compatibilité.
              </p>
            </div>
            
            <Button 
              className="w-full" 
              onClick={handleSheetImport} 
              disabled={!sheetsUrl || isLoading}
            >
              {isLoading ? (
                <>Importation en cours...</>
              ) : (
                <>
                  <Link className="mr-2 h-4 w-4" />
                  Importer depuis Google Sheets
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="border rounded-lg p-4 bg-amber-50">
          <div className="flex items-start">
            <AlertCircle className="text-amber-500 mr-3 mt-1" size={20} />
            <div>
              <h3 className="font-medium text-amber-800">Format des données</h3>
              <p className="text-sm text-amber-700 mt-1">
                L'importation supporte deux formats:
              </p>
              <ul className="list-disc list-inside mt-2 text-sm text-amber-700">
                <li>
                  <strong>Format standard:</strong> Un document avec trois onglets nommés "teams", "players" et "matches"
                </li>
                <li>
                  <strong>Format Oracle's Elixir:</strong> Un document avec un seul onglet au format Oracle's Elixir (recommandé)
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {renderImportStatus()}
      </CardContent>
    </Card>
  );
};

export default CsvDataManager;
