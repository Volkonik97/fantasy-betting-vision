
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PlayerImagesImport from "@/components/player/image-import/PlayerImagesImport";
import MissingImagesCsvExport from "@/components/player/image-management/MissingImagesCsvExport";
import { Player } from "@/utils/models/types";
import { loadAllPlayersInBatches } from "@/services/playerService";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface PlayerImagesSectionProps {
  bucketStatus: "loading" | "exists" | "error";
  rlsEnabled: boolean;
  showRlsHelp: () => void;
}

const PlayerImagesSection = ({ bucketStatus, rlsEnabled, showRlsHelp }: PlayerImagesSectionProps) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState<string>("Chargement des joueurs...");
  const [loadingProgress, setLoadingProgress] = useState<number>(0);

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        setIsLoading(true);
        setLoadingStatus("Préparation du chargement des joueurs...");
        setLoadingProgress(5);

        // Use the batch loading service instead of direct getPlayers
        const playersList = await loadAllPlayersInBatches((progress, total, batch) => {
          const percentage = Math.round((progress / total) * 100);
          setLoadingProgress(5 + (percentage * 0.9)); // 5% to 95%
          setLoadingStatus(`Chargement des joueurs... ${progress}/${total} (lot ${batch})`);
        });
        
        setLoadingProgress(100);
        setLoadingStatus("Chargement terminé");
        console.log(`Loaded ${playersList.length} players in batches`);
        setPlayers(playersList);
      } catch (error) {
        console.error("Error loading players:", error);
        setLoadingStatus(`Erreur lors du chargement: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlayers();
  }, []);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-6 bg-white rounded-lg shadow-sm"
      >
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">{loadingStatus}</h3>
            <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-md">
              <div 
                className="bg-blue-500 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Cela peut prendre un moment si vous avez beaucoup de joueurs.</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className={bucketStatus !== "exists" ? "opacity-50 pointer-events-none" : ""}
    >
      {players.length > 0 && (
        <Alert className="mb-6 bg-green-50 border-green-100">
          <AlertTitle className="text-green-700">
            {players.length} joueurs chargés avec succès
          </AlertTitle>
          <AlertDescription className="text-green-600">
            Vous pouvez maintenant télécharger des images pour ces joueurs ou exporter la liste des joueurs sans images.
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-6 p-4 bg-slate-50 border rounded-lg">
        <h3 className="text-lg font-medium mb-3">Exporter les joueurs sans images</h3>
        <p className="text-sm text-gray-600 mb-3">
          Cliquez sur le bouton ci-dessous pour télécharger un fichier CSV contenant la liste des joueurs qui n'ont pas d'images associées.
        </p>
        <MissingImagesCsvExport 
          players={players} 
          isDisabled={isLoading || bucketStatus !== "exists"} 
        />
      </div>

      <PlayerImagesImport 
        bucketStatus={bucketStatus}
        rlsEnabled={rlsEnabled}
        showRlsHelp={showRlsHelp}
      />
    </motion.div>
  );
};

export default PlayerImagesSection;
