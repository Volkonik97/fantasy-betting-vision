
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PlayerImagesImport from "@/components/player/PlayerImagesImport";
import MissingImagesCsvExport from "@/components/player/image-management/MissingImagesCsvExport";
import { Player } from "@/utils/models/types";
import { getPlayers } from "@/utils/database/playersService";

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
        const playersList = await getPlayers();
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
      <div className="mb-4 flex justify-end">
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
