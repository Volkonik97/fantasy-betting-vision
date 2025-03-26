
import React, { useState } from "react";
import { loadCsvData } from "@/utils/csvService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, FileUp, CheckCircle2 } from "lucide-react";

const CsvDataManager = () => {
  const [teamsFile, setTeamsFile] = useState<File | null>(null);
  const [playersFile, setPlayersFile] = useState<File | null>(null);
  const [matchesFile, setMatchesFile] = useState<File | null>(null);
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

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Gestionnaire de données CSV</CardTitle>
        <CardDescription>
          Importez vos fichiers CSV contenant les statistiques des équipes, joueurs et matchs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
      </CardContent>
    </Card>
  );
};

export default CsvDataManager;
