
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PlayerImagesImport from "@/components/player/image-import/PlayerImagesImport";
import MissingImagesCsvExport from "@/components/player/image-management/MissingImagesCsvExport";
import { Player } from "@/utils/models/types";
import { loadAllPlayersInBatches } from "@/services/playerService";

interface PlayerImagesSectionProps {
  bucketStatus: "loading" | "exists" | "error";
  rlsEnabled: boolean;
  showRlsHelp: () => void;
}

const PlayerImagesSection = ({ bucketStatus, rlsEnabled, showRlsHelp }: PlayerImagesSectionProps) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        setIsLoading(true);
        // Use the batch loading service instead of direct getPlayers
        const playersList = await loadAllPlayersInBatches();
        console.log(`Loaded ${playersList.length} players in batches`);
        setPlayers(playersList);
      } catch (error) {
        console.error("Error loading players:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlayers();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className={bucketStatus !== "exists" ? "opacity-50 pointer-events-none" : ""}
    >
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
