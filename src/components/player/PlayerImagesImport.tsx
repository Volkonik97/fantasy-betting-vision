
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Player } from "@/utils/models/types";
import { getPlayers } from "@/utils/database/playersService";

// Import the new component types
import { PlayerWithImage, ImageUploadError } from "./image-import/types";

// Import the new components
import DropZone from "./image-import/DropZone";
import UploadErrorAlert from "./image-import/UploadErrorAlert";
import UploadControls from "./image-import/UploadControls";
import UnmatchedImagesList from "./image-import/UnmatchedImagesList";
import PlayerImagesFilter from "./image-import/PlayerImagesFilter";
import PlayerImagesList from "./image-import/PlayerImagesList";
import RlsWarning from "./image-import/RlsWarning";
import BucketStatusInfo from "./image-import/BucketStatusInfo";

interface PlayerImagesImportProps {
  bucketStatus?: "loading" | "exists" | "error";
  rlsEnabled?: boolean;
  showRlsHelp?: () => void;
}

const PlayerImagesImport = ({ 
  bucketStatus, 
  rlsEnabled = false,
  showRlsHelp = () => {}
}: PlayerImagesImportProps) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [playerImages, setPlayerImages] = useState<PlayerWithImage[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [unmatched, setUnmatched] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [bucketExists, setBucketExists] = useState<boolean | null>(null);
  const [uploadErrors, setUploadErrors] = useState<ImageUploadError>({
    count: 0,
    lastError: null
  });
  const [rlsStatus, setRlsStatus] = useState({
    checked: false,
    canUpload: false,
    canList: false
  });

  useEffect(() => {
    loadPlayers();
  }, []);

  useEffect(() => {
    if (bucketStatus === "exists") {
      setBucketExists(true);
    } else if (bucketStatus === "error") {
      setBucketExists(false);
    }
  }, [bucketStatus]);

  useEffect(() => {
    setRlsStatus({
      checked: rlsEnabled !== undefined, 
      canUpload: !rlsEnabled,
      canList: !rlsEnabled
    });
  }, [rlsEnabled]);

  const loadPlayers = async () => {
    setIsLoading(true);
    try {
      const playersList = await getPlayers();
      setPlayers(playersList);
      console.log("Loaded players:", playersList.length);
      
      const playersWithImages = playersList.filter(player => player.image);
      console.log("Players with images:", playersWithImages.length);
      if (playersWithImages.length > 0) {
        console.log("Sample player with image:", playersWithImages[0].name, playersWithImages[0].image);
      }
      
      const initialPlayerImages = playersList.map(player => ({
        player,
        imageFile: null,
        newImageUrl: null,
        processed: false
      }));
      setPlayerImages(initialPlayerImages);
    } catch (error) {
      console.error("Error loading players:", error);
      toast.error("Erreur lors du chargement des joueurs");
    } finally {
      setIsLoading(false);
    }
  };

  const normalizeString = (str: string): string => {
    return str
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
  };

  const findMatchingPlayer = (fileName: string, playerImages: PlayerWithImage[]): number => {
    const normalizedFileName = normalizeString(fileName);
    
    const exactMatch = playerImages.findIndex(item => 
      normalizeString(item.player.name) === normalizedFileName
    );
    
    if (exactMatch !== -1) return exactMatch;
    
    const containsFullName = playerImages.findIndex(item => 
      normalizedFileName.includes(normalizeString(item.player.name))
    );
    
    if (containsFullName !== -1) return containsFullName;
    
    const nameContainsFileName = playerImages.findIndex(item => 
      normalizeString(item.player.name).includes(normalizedFileName)
    );
    
    if (nameContainsFileName !== -1) return nameContainsFileName;
    
    for (let i = 0; i < playerImages.length; i++) {
      const playerName = playerImages[i].player.name;
      const playerWords = playerName.split(/\s+/);
      
      for (const word of playerWords) {
        if (word.length > 2) {
          const normalizedWord = normalizeString(word);
          if (normalizedFileName.includes(normalizedWord) || 
              normalizedWord.includes(normalizedFileName)) {
            return i;
          }
        }
      }
    }
    
    return -1;
  };

  const handleFileSelect = (files: File[]) => {
    processFiles(files);
  };

  const processFiles = (files: File[]) => {
    const updatedPlayerImages = [...playerImages];
    const unmatchedFiles: File[] = [];
    
    files.forEach(file => {
      const fileName = file.name.toLowerCase().replace(/\.[^/.]+$/, "");
      
      const playerIndex = findMatchingPlayer(fileName, updatedPlayerImages);
      
      if (playerIndex !== -1) {
        const objectUrl = URL.createObjectURL(file);
        
        updatedPlayerImages[playerIndex] = {
          ...updatedPlayerImages[playerIndex],
          imageFile: file,
          newImageUrl: objectUrl
        };
      } else {
        unmatchedFiles.push(file);
      }
    });
    
    setPlayerImages(updatedPlayerImages);
    setUnmatched(unmatchedFiles);
    
    if (unmatchedFiles.length > 0) {
      toast.warning(`${unmatchedFiles.length} images n'ont pas pu être associées à des joueurs`);
    }
  };

  const manuallyAssignFile = (file: File, playerIndex: number) => {
    const updatedPlayerImages = [...playerImages];
    const objectUrl = URL.createObjectURL(file);
    
    updatedPlayerImages[playerIndex] = {
      ...updatedPlayerImages[playerIndex],
      imageFile: file,
      newImageUrl: objectUrl
    };
    
    setPlayerImages(updatedPlayerImages);
    
    setUnmatched(prev => prev.filter(f => f !== file));
  };

  const uploadImages = async () => {
    if (!bucketExists) {
      toast.error("Le bucket de stockage n'est pas accessible. Impossible de télécharger les images.");
      return;
    }
    
    setUploadErrors({ count: 0, lastError: null });
    setIsUploading(true);
    setUploadProgress(0);
    
    const playersToUpdate = playerImages.filter(p => p.imageFile !== null);
    let processed = 0;
    const total = playersToUpdate.length;
    
    if (total === 0) {
      toast.info("Aucune image à télécharger");
      setIsUploading(false);
      return;
    }
    
    const updatedPlayerImages = [...playerImages];
    let successCount = 0;
    let errorCount = 0;
    let lastErrorMessage = null;
    
    for (const playerData of playersToUpdate) {
      try {
        if (!playerData.imageFile) continue;
        
        const playerId = playerData.player.id;
        const file = playerData.imageFile;
        
        const fileName = `${playerId}_${Date.now()}.${file.name.split('.').pop()}`;
        
        console.log(`Uploading file ${fileName} to player-images bucket for player ${playerId}`);
        
        const { error: bucketError } = await supabase.storage.from('player-images').list('', { limit: 1 });
        
        if (bucketError) {
          console.error("Error accessing bucket before upload:", bucketError);
          toast.error("Erreur d'accès au bucket de stockage. Vérifiez les permissions.");
          errorCount++;
          lastErrorMessage = bucketError.message;
          continue;
        }
        
        const uploadPromise = supabase.storage.from('player-images').upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
        
        const uploadTimeout = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Upload timeout")), 30000);
        });
        
        const { data: uploadData, error: uploadError } = await Promise.race([
          uploadPromise,
          uploadTimeout.then(() => ({ data: null, error: new Error("Upload timeout") }))
        ]) as any;
        
        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          
          if (uploadError.message?.includes("violates row-level security policy")) {
            lastErrorMessage = "Erreur de politique de sécurité RLS. Vérifiez les permissions du bucket.";
          } else {
            lastErrorMessage = uploadError.message;
          }
          
          errorCount++;
          continue;
        }
        
        console.log("Upload successful, data:", uploadData);
        
        const { data: { publicUrl } } = supabase
          .storage
          .from('player-images')
          .getPublicUrl(fileName);
        
        console.log(`Public URL for player ${playerId}: ${publicUrl}`);
        
        const { error: updateError } = await supabase
          .from('players')
          .update({ image: publicUrl })
          .eq('id', playerId);
        
        if (updateError) {
          console.error("Error updating player:", updateError);
          toast.error(`Erreur lors de la mise à jour du joueur ${playerData.player.name}`);
          errorCount++;
          lastErrorMessage = updateError.message;
          continue;
        }
        
        console.log(`Updated player ${playerData.player.name} with new image URL: ${publicUrl}`);
        
        const playerIndex = updatedPlayerImages.findIndex(p => p.player.id === playerId);
        if (playerIndex !== -1) {
          updatedPlayerImages[playerIndex] = {
            ...updatedPlayerImages[playerIndex],
            processed: true,
            player: {
              ...updatedPlayerImages[playerIndex].player,
              image: publicUrl
            }
          };
        }

        successCount++;
        
      } catch (error) {
        console.error("Error processing player image:", error);
        errorCount++;
        lastErrorMessage = error instanceof Error ? error.message : String(error);
      } finally {
        processed++;
        setUploadProgress(Math.round((processed / total) * 100));
      }
    }
    
    if (errorCount > 0) {
      setUploadErrors({
        count: errorCount,
        lastError: lastErrorMessage
      });
    }
    
    setPlayerImages(updatedPlayerImages);
    setIsUploading(false);
    
    if (successCount > 0) {
      toast.success(`${successCount} images de joueurs téléchargées avec succès`);
    }
    
    if (errorCount > 0) {
      toast.error(`${errorCount} images n'ont pas pu être téléchargées`);
    }
  };

  const getFilteredPlayers = () => {
    switch (activeTab) {
      case "no-image":
        return playerImages.filter(p => !p.player.image && !p.newImageUrl);
      case "with-image":
        return playerImages.filter(p => p.player.image || p.newImageUrl);
      case "pending":
        return playerImages.filter(p => p.imageFile && !p.processed);
      case "processed":
        return playerImages.filter(p => p.processed);
      case "all":
      default:
        return playerImages;
    }
  };

  const filteredPlayers = getFilteredPlayers();
  const disableUpload = bucketExists === false || 
                        rlsEnabled || 
                        playerImages.filter(p => p.imageFile !== null).length === 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Importer des images de joueurs</CardTitle>
        <CardDescription>
          Téléchargez des images pour les joueurs. Les fichiers seront associés aux joueurs selon leur nom.
        </CardDescription>
        
        <BucketStatusInfo 
          bucketExists={bucketExists} 
          rlsStatus={rlsStatus}
        />
        
        {rlsEnabled && (
          <RlsWarning showRlsHelp={showRlsHelp} />
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <DropZone 
          onFileSelect={handleFileSelect}
          disabled={bucketExists === false || rlsEnabled}
        />

        <UploadErrorAlert 
          errorCount={uploadErrors.count} 
          lastError={uploadErrors.lastError} 
        />

        <UploadControls 
          onUpload={uploadImages}
          disableUpload={disableUpload}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
        />

        <UnmatchedImagesList 
          unmatched={unmatched}
          playerOptions={playerImages}
          onAssign={manuallyAssignFile}
        />

        <Separator className="my-4" />

        <PlayerImagesFilter
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          playerImages={playerImages}
        >
          <PlayerImagesList 
            isLoading={isLoading} 
            filteredPlayers={filteredPlayers} 
          />
        </PlayerImagesFilter>
      </CardContent>
    </Card>
  );
};

export default PlayerImagesImport;
