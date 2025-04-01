
import React from "react";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { Player } from "@/utils/models/types";
import { toast } from "sonner";

interface MissingImagesCsvExportProps {
  players: Player[];
  isDisabled?: boolean;
}

const MissingImagesCsvExport = ({ players, isDisabled = false }: MissingImagesCsvExportProps) => {
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
        ...playersWithoutImages.map(player => 
          [
            player.id,
            `"${player.name}"`, // Wrapping with quotes to handle commas in names
            player.role,
            player.team
          ].join(",")
        )
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
      variant="outline"
      size="sm" 
      disabled={isDisabled}
      className="flex items-center gap-2"
    >
      <FileDown className="h-4 w-4" />
      Exporter liste joueurs sans images
    </Button>
  );
};

export default MissingImagesCsvExport;
