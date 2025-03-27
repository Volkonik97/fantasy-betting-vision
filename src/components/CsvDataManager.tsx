import React, { useState, useEffect } from "react";
import { loadFromGoogleSheets, hasDatabaseData } from "@/utils/csvService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link, Database, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

interface CsvDataManagerProps {
  onDataImported?: () => void;
}

const CsvDataManager = ({ onDataImported }: CsvDataManagerProps) => {
  const [sheetsUrl, setSheetsUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [isImportComplete, setIsImportComplete] = useState(false);
  const [hasDataInDb, setHasDataInDb] = useState(false);
  const [importStats, setImportStats] = useState<{teams: number, players: number, matches: number} | null>(null);

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
      console.log("Début de l'importation depuis Google Sheets:", sheetsUrl);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          if (prev < 90) return prev + 5;
          return prev;
        });
      }, 2000);
      
      // Pass deleteExisting=true to ensure clean imports
      const result = await loadFromGoogleSheets(sheetsUrl, true);
      
      clearInterval(progressInterval);
      
      if (result === false) {
        setImportProgress(0);
        setIsImportComplete(false);
        setIsLoading(false);
        return;
      }
      
      setImportProgress(100);
      setIsImportComplete(true);
      setImportStats({
        teams: result.teams.length,
        players: result.players.length,
        matches: result.matches.length
      });
      
      console.log("Résultat de l'importation:", {
        teams: result.teams.length,
        players: result.players.length, 
        matches: result.matches.length
      });
      
      toast.success(`Données chargées avec succès depuis Google Sheets: ${result.teams.length} équipes, ${result.players.length} joueurs, ${result.matches.length} matchs`);
      
      if (onDataImported) {
        await onDataImported();
      }
      
      setHasDataInDb(true);
      
      // Rediriger vers la page d'accueil après chargement
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
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
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-medium text-green-800 mb-2">Importation terminée !</h3>
          <ul className="text-sm text-green-700">
            <li>• {importStats.teams} équipes importées</li>
            <li>• {importStats.players} joueurs importés</li>
            <li>• {importStats.matches} matchs importés</li>
          </ul>
          <p className="text-sm mt-2 text-green-700">
            Redirection vers la page d'accueil...
          </p>
        </div>
      );
    }
    
    if (isLoading) {
      return (
        <div className="mt-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">Importation en cours...</span>
            <span className="text-sm font-medium">{importProgress}%</span>
          </div>
          <Progress value={importProgress} className="h-2" />
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
                Les nouvelles données importées remplaceront les données existantes.
              </p>
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
