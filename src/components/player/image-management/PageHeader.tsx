
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import DatabaseConnectionStatus from "./DatabaseConnectionStatus";

interface PageHeaderProps {
  onCheckBucket: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ onCheckBucket }) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Gestion des images de joueurs</h1>
          <p className="text-gray-500">
            Téléchargez, gérez et vérifiez les images des joueurs
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <DatabaseConnectionStatus />
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={onCheckBucket}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Vérifier le bucket
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
