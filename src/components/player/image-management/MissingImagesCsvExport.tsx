
import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Player } from "@/utils/models/types";
import { hasPlayerImage } from "../image-import/types";

interface MissingImagesCsvExportProps {
  players: Player[];
  isDisabled: boolean;
}

const MissingImagesCsvExport = ({ players, isDisabled }: MissingImagesCsvExportProps) => {
  // Fonction pour générer un fichier CSV des joueurs sans images
  const exportMissingPlayersToCsv = () => {
    const missingImagePlayers = players.filter(player => !hasPlayerImage(player));
    
    if (missingImagePlayers.length === 0) {
      alert("Tous les joueurs ont déjà une image associée.");
      return;
    }
    
    // Créer l'en-tête du CSV
    let csvContent = "Nom,ID,Équipe,Rôle\n";
    
    // Ajouter chaque joueur au CSV
    missingImagePlayers.forEach(player => {
      const line = [
        player.name.replace(/,/g, ' '),
        player.id,
        player.team || 'N/A',
        player.role || 'N/A'
      ].map(val => `"${val}"`).join(',');
      
      csvContent += line + "\n";
    });
    
    // Créer un Blob et le télécharger
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'joueurs_sans_images.csv');
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={exportMissingPlayersToCsv}
      disabled={isDisabled}
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      Exporter CSV
    </Button>
  );
};

export default MissingImagesCsvExport;
