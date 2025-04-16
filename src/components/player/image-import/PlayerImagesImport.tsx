
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

import { Player } from "@/utils/models/types";
import { getPlayers } from "@/utils/database/playersService";
import { PlayerWithImage } from "./types";

import ImportHeader from "./ImportHeader";
import DropZone from "./DropZone";
import UploadErrorAlert from "./UploadErrorAlert";
import UploadControls from "./UploadControls";
import UnmatchedImagesList from "./UnmatchedImagesList";
import PlayerImagesFilter from "./PlayerImagesFilter";
import PlayerImagesList from "./PlayerImagesList";
import ImageUploadManager from "./ImageUploadManager";

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
  const [playerImages, setPlayerImages] = useState<PlayerWithImage[]>([]);
  const [unmatched, setUnmatched] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [bucketExists, setBucketExists] = useState<boolean | null>(null);
  const [uploadErrors, setUploadErrors] = useState({
    count: 0,
    lastError: null as string | null
  });
  
  const [uploadManager] = useState(() => 
    new ImageUploadManager({
      setIsUploading: () => {},
      setUploadProgress: () => {},
      setUploadErrors,
      setPlayerImages
    })
  );

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

  const loadPlayers = async () => {
    setIsLoading(true);
    try {
      const firstBatch = await getPlayers(1, 1000);
      let allPlayers = [...firstBatch];
      
      const initialPlayerImages: PlayerWithImage[] = allPlayers.map(player => ({
        player,
        imageFile: null,
        newImageUrl: null,
        processed: false
      }));
      setPlayers(allPlayers);
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

  const findMatchingPlayer = (fileName: string): number => {
    const normalizedFileName = normalizeString(fileName);
    
    for (let i = 0; i < playerImages.length; i++) {
      const normalizedPlayerName = normalizeString(playerImages[i].player.name);
      
      if (normalizedPlayerName === normalizedFileName) {
        return i;
      }
      
      if (normalizedFileName.includes(normalizedPlayerName)) {
        return i;
      }
      
      if (normalizedPlayerName.includes(normalizedFileName)) {
        return i;
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
      const matchIndex = findMatchingPlayer(fileName);
      
      if (matchIndex !== -1) {
        const objectUrl = URL.createObjectURL(file);
        
        updatedPlayerImages[matchIndex] = {
          ...updatedPlayerImages[matchIndex],
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
    
    await uploadManager.uploadImages(playerImages, bucketExists);
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
      <ImportHeader 
        bucketExists={bucketExists} 
        rlsEnabled={rlsEnabled}
        showRlsHelp={showRlsHelp}
      />
      
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
          isUploading={uploadManager.isUploading}
          uploadProgress={uploadManager.uploadProgress}
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
