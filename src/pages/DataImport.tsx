
import React from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import CsvDataManager from "@/components/CsvDataManager";

const DataImport = () => {
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
            Importez vos fichiers CSV contenant les statistiques pour alimenter le site
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <CsvDataManager />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-12 bg-white p-6 rounded-lg shadow-sm"
        >
          <h2 className="text-xl font-semibold mb-4">Format des fichiers CSV</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-blue-600 mb-2">Fichier des équipes (teams.csv)</h3>
              <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                <pre className="text-sm">
                  id,name,logo,region,winRate,blueWinRate,redWinRate,averageGameTime
                </pre>
                <pre className="text-sm text-gray-500 mt-2">
                  t1,T1,https://example.com/t1.png,LCK,0.82,0.85,0.79,28.5
                </pre>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-blue-600 mb-2">Fichier des joueurs (players.csv)</h3>
              <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                <pre className="text-sm">
                  id,name,role,image,team,kda,csPerMin,damageShare,championPool
                </pre>
                <pre className="text-sm text-gray-500 mt-2">
                  p1,Faker,Mid,https://example.com/faker.png,t1,5.6,9.1,0.28,"Azir,Ahri,Ryze"
                </pre>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-blue-600 mb-2">Fichier des matchs (matches.csv)</h3>
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
        </motion.div>
      </main>
    </div>
  );
};

export default DataImport;
