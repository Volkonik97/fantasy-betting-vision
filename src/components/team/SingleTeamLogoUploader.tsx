
import React, { useState, useRef } from "react";
import { toast } from "sonner";
import { uploadTeamLogo } from "@/utils/database/teams/logoUtils";
import { Team } from "@/utils/models/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, AlertCircle, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface SingleTeamLogoUploaderProps {
  teams: Team[];
  onComplete?: () => void;
}

const SingleTeamLogoUploader: React.FC<SingleTeamLogoUploaderProps> = ({ teams, onComplete }) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{success: boolean, message: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTeamId) {
      toast.error("Veuillez sélectionner une équipe et un fichier");
      return;
    }
    
    setIsUploading(true);
    setProgress(10);
    setResult(null);
    
    try {
      // Get the selected team
      const team = teams.find(t => t.id === selectedTeamId);
      
      if (!team) {
        toast.error("Équipe non trouvée");
        setResult({
          success: false,
          message: "Équipe non trouvée dans la liste"
        });
        return;
      }
      
      setProgress(50);
      
      // Upload the logo
      const logoUrl = await uploadTeamLogo(selectedTeamId, file);
      setProgress(100);
      
      if (logoUrl) {
        setResult({
          success: true,
          message: `Logo téléchargé avec succès pour ${team.name}`
        });
        toast.success(`Logo téléchargé avec succès pour ${team.name}`);
        if (onComplete) onComplete();
      } else {
        setResult({
          success: false,
          message: `Échec du téléchargement du logo pour ${team.name}`
        });
        toast.error(`Échec du téléchargement du logo pour ${team.name}`);
      }
    } catch (error) {
      console.error("Error uploading team logo:", error);
      setResult({
        success: false,
        message: "Erreur lors du téléchargement du logo"
      });
      toast.error("Erreur lors du téléchargement du logo");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    if (!selectedTeamId) {
      toast.error("Veuillez d'abord sélectionner une équipe");
      return;
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4 border-t pt-4 mt-4">
      <h3 className="text-lg font-medium mb-2">Télécharger un logo pour une équipe spécifique</h3>
      <p className="text-sm text-gray-500 mb-4">
        Sélectionnez une équipe dans la liste et téléchargez son logo
      </p>
      
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="w-full sm:w-1/2">
          <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une équipe" />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              {teams
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name} ({team.region})
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            onClick={triggerFileInput} 
            disabled={isUploading || !selectedTeamId}
            className="flex items-center gap-2"
          >
            <Upload size={16} />
            Sélectionner un logo
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileSelect}
          />
        </div>
      </div>
      
      {isUploading && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-500 text-center">
            Téléchargement en cours... {progress}%
          </p>
        </div>
      )}
      
      {result && (
        <Alert className={result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
          {result.success ? 
            <Check className="h-4 w-4 text-green-600" /> : 
            <AlertCircle className="h-4 w-4 text-red-600" />
          }
          <AlertDescription>
            {result.message}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="text-sm text-amber-500 mt-4 p-2 border border-amber-200 bg-amber-50 rounded-md">
        <p className="font-medium">Fonctionnalité temporaire</p>
        <p>Cette fonctionnalité est temporaire jusqu'à ce que toutes les équipes aient un logo.</p>
      </div>
    </div>
  );
};

export default SingleTeamLogoUploader;
