
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { Player } from "@/utils/models/types";
import { toast } from "sonner";
import { getTeamNameFromCache } from "@/utils/database/teams/teamCache";

interface MissingImagesCsvExportProps {
  players: Player[];
  isDisabled?: boolean;
}

const MissingImagesCsvExport = ({ players, isDisabled = false }: MissingImagesCsvExportProps) => {
  // Ensure all players have team names assigned
  useEffect(() => {
    players.forEach(player => {
      if (!player.teamName && player.team) {
        // Try to find team name from cache
        const teamName = getTeamNameFromCache(player.team);
        if (teamName) {
          player.teamName = teamName;
        }
      }
    });
  }, [players]);

  const handleExportCsv = () => {
    try {
      // Filter players without images
      const playersWithoutImages = players.filter(player => !player.image);
      
      if (playersWithoutImages.length === 0) {
        toast.info("Tous les joueurs ont des images associées.");
        return;
      }
      
      // Create CSV content
      const headers = ["ID", "Nom", "Role", "Équipe"];
      const csvRows = [
        headers.join(","), // CSV header row
        ...playersWithoutImages.map(player => {
          // Get team name, prioritizing existing teamName, or fetching from cache as fallback
          let teamName = player.teamName;
          if (!teamName && player.team) {
            teamName = getTeamNameFromCache(player.team) || player.team;
          }
          
          return [
            player.id,
            `"${player.name}"`, // Wrapping with quotes to handle commas in names
            player.role,
            `"${teamName || 'Équipe inconnue'}"` // Always use team name, fallback to 'Équipe inconnue'
          ].join(",");
        })
      ];
      
      const csvContent = csvRows.join("\n");
      
      // Create a downloadable blob
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      
      // Create temporary link and trigger download
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `joueurs_sans_images_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`CSV exporté contenant ${playersWithoutImages.length} joueurs sans images`);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.error("Erreur lors de l'exportation du CSV");
    }
  };

  return (
    <Button
      onClick={handleExportCsv}
      variant="default"
      size="lg" 
      disabled={isDisabled}
      className="w-full flex items-center justify-center gap-2"
    >
      <FileDown className="h-5 w-5" />
      Télécharger la liste des joueurs sans images (CSV)
    </Button>
  );
};

export default MissingImagesCsvExport;
