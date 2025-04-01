
import React from "react";
import { motion } from "framer-motion";
import PlayerImagesImport from "@/components/player/PlayerImagesImport";

interface PlayerImagesSectionProps {
  bucketStatus: "loading" | "exists" | "error";
  rlsEnabled: boolean;
  showRlsHelp: () => void;
}

const PlayerImagesSection = ({ bucketStatus, rlsEnabled, showRlsHelp }: PlayerImagesSectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className={bucketStatus !== "exists" ? "opacity-50 pointer-events-none" : ""}
    >
      <PlayerImagesImport 
        bucketStatus={bucketStatus}
        rlsEnabled={rlsEnabled}
        showRlsHelp={showRlsHelp}
      />
    </motion.div>
  );
};

export default PlayerImagesSection;
