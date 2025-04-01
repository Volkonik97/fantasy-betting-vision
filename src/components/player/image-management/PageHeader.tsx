
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

interface PageHeaderProps {
  onCheckBucket: () => void;
}

const PageHeader = ({ onCheckBucket }: PageHeaderProps) => {
  return (
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
      
      <div className="mt-4">
        <Button
          onClick={onCheckBucket}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          Vérifier l'accès au bucket
        </Button>
      </div>
    </motion.div>
  );
};

export default PageHeader;
