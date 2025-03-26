
import React, { useState } from "react";
import { loadCsvData, loadFromGoogleSheets } from "@/utils/csvService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, FileUp, CheckCircle2, Link } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CsvDataManager = () => {
  const [teamsFile, setTeamsFile] = useState<File | null>(null);
  const [playersFile, setPlayersFile] = useState<File | null>(null);
  const [matchesFile, setMatchesFile] = useState<File | null>(null);
  const [sheetsUrl, setSheetsUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

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

  const handleUpload = async () => {
    if (!teamsFile || !playersFile || !matchesFile) {
      toast.error("Veuillez sélectionner tous les fichiers requis");
      return;
    }

    try {
      setIsLoading(true);
      const data = await loadCsvData(teamsFile, playersFile, matchesFile);
      
      toast.success(`Données chargées avec succès: ${data.teams.length} équipes, ${data.players.length} joueurs, ${data.matches.length} matchs`);
      
      // Rediriger vers la page d'accueil après chargement
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (error) {
      console.error("Erreur de chargement:", error);
      toast.error("Erreur lors du chargement des fichiers CSV");
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
      const data = await loadFromGoogleSheets(sheetsUrl);
      
      toast.success(`Données chargées avec succès depuis Google Sheets: ${data.teams.length} équipes, ${data.players.length} joueurs, ${data.matches.length} matchs`);
      
      // Rediriger vers la page d'accueil après chargement
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (error) {
      console.error("Erreur de chargement:", error);
      toast.error("Erreur lors du chargement des données depuis Google Sheets");
    } finally {
      setIsLoading(false);
    }
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
            </div>

            <Button 
              className="w-full" 
              onClick={handleUpload} 
              disabled={!teamsFile || !playersFile || !matchesFile || isLoading}
            >
              {isLoading ? (
                <>Chargement en cours...</>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Charger les données
                </>
              )}
            </Button>
          </TabsContent>
          
          <TabsContent value="sheets" className="space-y-4 mt-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">URL Google Sheets</h3>
              <p className="text-sm text-gray-500 mb-4">
                Entrez l'URL d'un document Google Sheets contenant les onglets "teams", "players" et "matches"
              </p>
              <div className="space-y-4">
                <Input
                  type="url"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  value={sheetsUrl}
                  onChange={(e) => setSheetsUrl(e.target.value)}
                />
                
                <Button 
                  className="w-full" 
                  onClick={handleSheetImport} 
                  disabled={!sheetsUrl || isLoading}
                >
                  {isLoading ? (
                    <>Chargement en cours...</>
                  ) : (
                    <>
                      <Link className="mr-2 h-4 w-4" />
                      Importer depuis Google Sheets
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CsvDataManager;
