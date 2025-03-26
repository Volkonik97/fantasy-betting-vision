
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import CsvDataManager from "@/components/CsvDataManager";
import { hasDatabaseData, getLastDatabaseUpdate, clearDatabase } from "@/utils/csvService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const DataImport = () => {
  const [hasData, setHasData] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier s'il y a des données dans la base de données
    const checkData = async () => {
      setIsLoading(true);
      try {
        const hasDbData = await hasDatabaseData();
        setHasData(hasDbData);
        
        if (hasDbData) {
          const lastUpdateDate = await getLastDatabaseUpdate();
          setLastUpdate(lastUpdateDate);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification des données:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkData();
  }, []);

  const handleClearDatabase = async () => {
    try {
      const success = await clearDatabase();
      if (success) {
        toast.success("Base de données vidée avec succès");
        setHasData(false);
        setLastUpdate(null);
      } else {
        toast.error("Erreur lors de la suppression des données");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors de la suppression des données");
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d MMMM yyyy à HH:mm", { locale: fr });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Importation de données</h1>
          <p className="text-gray-600">
            Importez vos données statistiques via Google Sheets pour alimenter le site
          </p>
        </motion.div>
        
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center py-8"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lol-blue"></div>
          </motion.div>
        ) : hasData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-green-800 font-medium text-lg">Base de données active</h2>
                {lastUpdate && (
                  <p className="text-green-700 text-sm">
                    Dernière mise à jour: {formatDate(lastUpdate)}
                  </p>
                )}
              </div>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleClearDatabase}
                className="ml-4"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Vider la base
              </Button>
            </div>
          </motion.div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <CsvDataManager onDataImported={async () => {
            setHasData(true);
            const lastUpdateDate = await getLastDatabaseUpdate();
            setLastUpdate(lastUpdateDate);
          }} />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-12 space-y-6"
        >
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Formats de données pris en charge</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-blue-600 mb-2">Option 1: Document Google Sheets avec trois onglets</h3>
                
                <div>
                  <h4 className="font-medium mb-2">Onglet "teams"</h4>
                  <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                    <pre className="text-sm">
                      id,name,logo,region,winRate,blueWinRate,redWinRate,averageGameTime
                    </pre>
                    <pre className="text-sm text-gray-500 mt-2">
                      t1,T1,https://example.com/t1.png,LCK,0.82,0.85,0.79,28.5
                    </pre>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Onglet "players"</h4>
                  <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                    <pre className="text-sm">
                      id,name,role,image,team,kda,csPerMin,damageShare,championPool
                    </pre>
                    <pre className="text-sm text-gray-500 mt-2">
                      p1,Faker,Mid,https://example.com/faker.png,t1,5.6,9.1,0.28,"Azir,Ahri,Ryze"
                    </pre>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Onglet "matches"</h4>
                  <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                    <pre className="text-sm">
                      id,tournament,date,teamBlueId,teamRedId,predictedWinner,blueWinOdds,redWinOdds,status,winnerTeamId,scoreBlue,scoreRed,duration,mvp,firstBlood,firstDragon,firstBaron
                    </pre>
                    <pre className="text-sm text-gray-500 mt-2">
                      m1,Worlds 2023,2023-10-30T14:00:00Z,t1,geng,t1,0.58,0.42,Upcoming,,,,,,,,,
                    </pre>
                    <pre className="text-sm text-gray-500 mt-2">
                      m2,Worlds 2023,2023-10-29T15:00:00Z,geng,jdg,geng,0.55,0.45,Completed,geng,3,2,32:18,Chovy,jdg,geng,geng
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Option 2: Fichier de données League of Legends (Format Oracle's Elixir)</h2>
            
            <div className="p-4 bg-blue-50 text-blue-700 rounded-md mb-4">
              <p className="text-sm">
                L'application supporte le format à feuille unique avec toutes les statistiques de match 
                au format Oracle's Elixir. Cette option est idéale pour importer des données de matchs professionnels.
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
              <p className="text-sm font-medium mb-2">Exemple de colonnes supportées:</p>
              <pre className="text-xs text-gray-600 whitespace-normal">
                gameid, league, year, split, playoffs, date, game, patch, participantid, side, position, playername, playerid, 
                teamname, teamid, champion, gamelength, result, kills, deaths, assists, teamkills, teamdeaths, doublekills, 
                firstblood, dragons, barons, towers, etc.
              </pre>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 text-blue-700 rounded-md">
              <h3 className="font-medium mb-2">Utilisation avec Google Sheets</h3>
              <p className="text-sm">
                Pour importer depuis Google Sheets, assurez-vous que:
              </p>
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>Le document est partagé en lecture publique (option "Toute personne disposant du lien peut consulter")</li>
                <li>L'URL du document est au format: https://docs.google.com/spreadsheets/d/VOTRE_ID_DE_DOCUMENT/...</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default DataImport;
