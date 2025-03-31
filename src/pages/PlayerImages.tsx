
import React from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import PlayerImagesImport from "@/components/player/PlayerImagesImport";

const PlayerImages = () => {
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
          <h1 className="text-3xl font-bold mb-2">Gestion des images des joueurs</h1>
          <p className="text-gray-600">
            Importez et gérez les photos des joueurs. Les images seront automatiquement associées aux joueurs selon leur nom de fichier.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <PlayerImagesImport />
        </motion.div>
      </main>
    </div>
  );
};

export default PlayerImages;
