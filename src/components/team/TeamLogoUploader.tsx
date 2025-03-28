
import React, { useState, useRef } from "react";
import { toast } from "sonner";
import { uploadTeamLogo, findTeamByName } from "@/utils/database/teams/logoUtils";
import { Team } from "@/utils/models/types";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Upload, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface TeamLogoUploaderProps {
  teams: Team[];
  onComplete?: () => void;
}

const TeamLogoUploader = ({ teams, onComplete }: TeamLogoUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [results, setResults] = useState<{success: string[], failed: string[]}>({
    success: [],
    failed: []
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setProgress(0);
    setUploadedCount(0);
    setResults({ success: [], failed: [] });
    
    const fileList = Array.from(files);
    console.log(`Selected ${fileList.length} files for upload`);
    
    const successfulUploads: string[] = [];
    const failedUploads: string[] = [];
    
    // Process files one by one
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const fileName = file.name.split('.')[0]; // Use filename without extension
      
      // Find team by name or ID
      const teamId = findTeamByName(teams, file.name);
      const team = teams.find(t => t.id === teamId);
      
      if (team) {
        try {
          const logoUrl = await uploadTeamLogo(team.id, file);
          if (logoUrl) {
            successfulUploads.push(`${team.name} (${fileName})`);
            console.log(`Uploaded logo for ${team.name} (${team.id}): ${logoUrl}`);
          } else {
            failedUploads.push(`${fileName}`);
            console.error(`Failed to upload logo for ${team.name} (${team.id})`);
          }
        } catch (error) {
          failedUploads.push(`${fileName}`);
          console.error(`Error uploading logo for ${team.name} (${team.id}):`, error);
        }
      } else {
        console.warn(`No team found matching filename: ${fileName}`);
        failedUploads.push(fileName);
      }
      
      // Update progress
      setUploadedCount(i + 1);
      setProgress(Math.round(((i + 1) / fileList.length) * 100));
    }
    
    setResults({
      success: successfulUploads,
      failed: failedUploads
    });
    
    setIsUploading(false);
    
    if (successfulUploads.length > 0) {
      toast.success(`${successfulUploads.length} logos d'équipe téléchargés avec succès`);
      if (onComplete) onComplete();
    }
    
    if (failedUploads.length > 0) {
      toast.error(`Échec du téléchargement de ${failedUploads.length} logos d'équipe`);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col">
        <h3 className="text-lg font-medium mb-2">Télécharger des logos d'équipe</h3>
        <p className="text-sm text-gray-500 mb-4">
          Sélectionnez les fichiers image pour les logos d'équipe. 
          Les noms des fichiers seront utilisés pour trouver les équipes correspondantes.
          Pour de meilleurs résultats, nommez les fichiers avec le nom exact de l'équipe 
          (exemple: T1.png, Gen_G.png).
        </p>
        
        <div className="flex items-center gap-4">
          <Button 
            onClick={triggerFileInput} 
            disabled={isUploading}
            className="flex items-center gap-2"
          >
            <Upload size={16} />
            Sélectionner des fichiers
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleFolderSelect}
          />
          
          {uploadedCount > 0 && (
            <span className="text-sm text-gray-500">
              {uploadedCount} fichier{uploadedCount > 1 ? 's' : ''} traité{uploadedCount > 1 ? 's' : ''}
            </span>
          )}
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
      
      {!isUploading && results.success.length > 0 && (
        <Alert className="bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle>Succès</AlertTitle>
          <AlertDescription>
            {results.success.length} logos ont été téléchargés avec succès.
          </AlertDescription>
        </Alert>
      )}
      
      {!isUploading && results.failed.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreurs</AlertTitle>
          <AlertDescription>
            Impossible de télécharger {results.failed.length} logos. 
            Vérifiez que les noms de fichiers correspondent aux noms ou ID d'équipe.
            <ul className="mt-2 text-sm list-disc pl-5 max-h-32 overflow-y-auto">
              {results.failed.slice(0, 10).map((name, index) => (
                <li key={index}>{name}</li>
              ))}
              {results.failed.length > 10 && (
                <li>...et {results.failed.length - 10} autres fichiers</li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default TeamLogoUploader;
