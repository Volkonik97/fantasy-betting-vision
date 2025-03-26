
import React, { useState, useEffect } from "react";
import { loadCsvData, loadFromGoogleSheets, hasDatabaseData } from "@/utils/csvService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, FileUp, CheckCircle2, Link, Database, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface CsvDataManagerProps {
  onDataImported?: () => void;
}

const CsvDataManager = ({ onDataImported }: CsvDataManagerProps) => {
  const [teamsFile, setTeamsFile] = useState<File | null>(null);
  const [playersFile, setPlayersFile] = useState<File | null>(null);
  const [matchesFile, setMatchesFile] = useState<File | null>(null);
  const [logsFile, setLogsFile] = useState<File | null>(null);
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

  const handleTeamsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTeamsFile(e.target.files[0]);
    }
  };

  const handlePlayersFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPlayersFile(e.target.files[0]);
    }
  };

  const handleMatchesFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMatchesFile(e.target.files[0]);
    }
  };

  const handleLogsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogsFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!teamsFile || !playersFile || !matchesFile) {
      toast.error("Veuillez sélectionner tous les fichiers requis");
      return;
    }

    try {
      setIsLoading(true);
      setImportProgress(10);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          if (prev < 90) return prev + 5;
          return prev;
        });
      }, 2000);
      
      const data = await loadCsvData(teamsFile, playersFile, matchesFile);
      
      clearInterval(progressInterval);
      setImportProgress(100);
      setIsImportComplete(true);
      setImportStats({
        teams: data.teams.length,
        players: data.players.length,
        matches: data.matches.length
      });
      
      toast.success(`Données chargées avec succès: ${data.teams.length} équipes, ${data.players.length} joueurs, ${data.matches.length} matchs`);
      
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
      toast.error(`Erreur lors du chargement des fichiers CSV: ${error instanceof Error ? error.message : String(error)}`);
      setImportProgress(0);
      setIsImportComplete(false);
    } finally {
      setIsLoading(false);
    }
  };

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
      
      const data = await loadFromGoogleSheets(sheetsUrl);
      
      clearInterval(progressInterval);
      setImportProgress(100);
      setIsImportComplete(true);
      setImportStats({
        teams: data.teams.length,
        players: data.players.length,
        matches: data.matches.length
      });
      
      console.log("Résultat de l'importation:", {
        teams: data.teams.length,
        players: data.players.length, 
        matches: data.matches.length
      });
      
      toast.success(`Données chargées avec succès depuis Google Sheets: ${data.teams.length} équipes, ${data.players.length} joueurs, ${data.matches.length} matchs`);
      
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
        <CardTitle>Gestionnaire de données</CardTitle>
        <CardDescription>
          Importez vos données statistiques via fichiers CSV ou Google Sheets
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
        
        <Tabs defaultValue="files">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="files">Fichiers CSV</TabsTrigger>
            <TabsTrigger value="sheets">Google Sheets</TabsTrigger>
          </TabsList>
          
          <TabsContent value="files" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium">Fichier des équipes (Teams)</h3>
                    <p className="text-sm text-gray-500">
                      CSV avec les colonnes: id, name, logo, region, winRate, blueWinRate, redWinRate, averageGameTime
                    </p>
                  </div>
                  {teamsFile && <CheckCircle2 className="text-green-500" size={20} />}
                </div>
                <div className="flex items-center gap-4">
                  <Button variant="outline" className="w-full" onClick={() => document.getElementById('teams-file-input')?.click()}>
                    <FileUp className="mr-2 h-4 w-4" />
                    Sélectionner le fichier
                  </Button>
                  <input
                    id="teams-file-input"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleTeamsFileChange}
                  />
                  {teamsFile && (
                    <span className="text-sm text-gray-700 truncate max-w-xs">
                      {teamsFile.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium">Fichier des joueurs (Players)</h3>
                    <p className="text-sm text-gray-500">
                      CSV avec les colonnes: id, name, role, image, team, kda, csPerMin, damageShare, championPool
                    </p>
                  </div>
                  {playersFile && <CheckCircle2 className="text-green-500" size={20} />}
                </div>
                <div className="flex items-center gap-4">
                  <Button variant="outline" className="w-full" onClick={() => document.getElementById('players-file-input')?.click()}>
                    <FileUp className="mr-2 h-4 w-4" />
                    Sélectionner le fichier
                  </Button>
                  <input
                    id="players-file-input"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handlePlayersFileChange}
                  />
                  {playersFile && (
                    <span className="text-sm text-gray-700 truncate max-w-xs">
                      {playersFile.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium">Fichier des matchs (Matches)</h3>
                    <p className="text-sm text-gray-500">
                      CSV avec les colonnes: id, tournament, date, teamBlueId, teamRedId, predictedWinner, blueWinOdds, redWinOdds, status, etc.
                    </p>
                  </div>
                  {matchesFile && <CheckCircle2 className="text-green-500" size={20} />}
                </div>
                <div className="flex items-center gap-4">
                  <Button variant="outline" className="w-full" onClick={() => document.getElementById('matches-file-input')?.click()}>
                    <FileUp className="mr-2 h-4 w-4" />
                    Sélectionner le fichier
                  </Button>
                  <input
                    id="matches-file-input"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleMatchesFileChange}
                  />
                  {matchesFile && (
                    <span className="text-sm text-gray-700 truncate max-w-xs">
                      {matchesFile.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-amber-50">
                <div className="flex items-start mb-4">
                  <AlertCircle className="text-amber-500 mr-3 mt-1" size={20} />
                  <div>
                    <h3 className="font-medium text-amber-800">Remarque importante sur le format des données</h3>
                    <p className="text-sm text-amber-700 mt-1">
                      L'importation de fichiers CSV est surtout utile pour des formats de données simples. 
                      Pour les données complètes au format Oracle's Elixir, l'option Google Sheets est recommandée.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              className="w-full" 
              onClick={handleUpload} 
              disabled={!teamsFile || !playersFile || !matchesFile || isLoading}
            >
              {isLoading ? (
                <>Importation en cours...</>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Charger les données
                </>
              )}
            </Button>
            
            {renderImportStatus()}
          </TabsContent>
          
          <TabsContent value="sheets" className="space-y-4 mt-4">
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
            
            {renderImportStatus()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CsvDataManager;
