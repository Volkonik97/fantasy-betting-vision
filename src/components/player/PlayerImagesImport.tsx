import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Player } from "@/utils/models/types";
import { getPlayers } from "@/utils/database/playersService";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface PlayerWithImage {
  player: Player;
  imageFile: File | null;
  newImageUrl: string | null;
  processed: boolean;
}

interface PlayerImagesImportProps {
  bucketStatus?: "loading" | "exists" | "error";
  rlsEnabled?: boolean;
}

const PlayerImagesImport = ({ bucketStatus, rlsEnabled = false }: PlayerImagesImportProps) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [playerImages, setPlayerImages] = useState<PlayerWithImage[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [unmatched, setUnmatched] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [bucketExists, setBucketExists] = useState<boolean | null>(null);
  const [uploadErrors, setUploadErrors] = useState<{count: number, lastError: string | null}>({
    count: 0,
    lastError: null
  });

  React.useEffect(() => {
    loadPlayers();
  }, []);

  React.useEffect(() => {
    if (bucketStatus === "exists") {
      setBucketExists(true);
    } else if (bucketStatus === "error") {
      setBucketExists(false);
    }
  }, [bucketStatus]);

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const files = Array.from(event.target.files);
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

  const getSortedPlayerOptions = () => {
    return [...playerImages].sort((a, b) => 
      a.player.name.localeCompare(b.player.name, 'fr', { sensitivity: 'base' })
    );
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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      processFiles(files);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
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
  const playersWithoutImages = playerImages.filter(p => !p.player.image && !p.newImageUrl).length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Importer des images de joueurs</CardTitle>
        <CardDescription>
          Téléchargez des images pour les joueurs. Les fichiers seront associés aux joueurs selon leur nom.
        </CardDescription>
        {bucketExists === false && (
          <div className="p-3 mt-2 bg-red-50 text-red-700 rounded-md border border-red-200">
            <p className="font-medium">Le bucket de stockage n'est pas accessible</p>
            <p className="text-sm">Impossible de télécharger des images pour le moment.</p>
          </div>
        )}
        {rlsEnabled && (
          <Alert className="mt-3 bg-amber-50 border-amber-100">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle>Problème de politiques RLS</AlertTitle>
            <AlertDescription>
              <p>Le téléchargement d'images va probablement échouer car les politiques RLS ne permettent pas le stockage de fichiers.</p>
              <p className="text-sm mt-1">Contactez l'administrateur du projet pour configurer correctement les politiques RLS.</p>
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors ${
            bucketExists === false || rlsEnabled ? 'border-red-300 bg-red-50 opacity-50' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          style={{ pointerEvents: bucketExists === false || rlsEnabled ? 'none' : 'auto' }}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileSelect} 
            multiple 
            accept="image/*" 
            disabled={bucketExists === false || rlsEnabled}
          />
          <div className="flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm font-medium mb-1">Cliquez ou déposez des fichiers ici</p>
            <p className="text-xs text-gray-500">PNG, JPG ou WEBP jusqu'à 5MB</p>
          </div>
        </div>

        {uploadErrors.count > 0 && (
          <Alert className="bg-red-50 border-red-100">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle>Erreurs de téléchargement</AlertTitle>
            <AlertDescription>
              <p>{uploadErrors.count} {uploadErrors.count > 1 ? 'images ont échoué' : 'image a échou��'} lors du téléchargement.</p>
              {uploadErrors.lastError && (
                <p className="text-sm mt-1 font-mono text-red-700 bg-red-50 p-1 rounded">{uploadErrors.lastError}</p>
              )}
              <p className="text-xs mt-1">
                Si l'erreur mentionne "violates row-level security policy", vérifiez les politiques RLS du bucket.
              </p>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Button 
            onClick={uploadImages} 
            className="w-full" 
            disabled={isUploading || playerImages.filter(p => p.imageFile !== null).length === 0 || bucketExists === false || rlsEnabled}
          >
            {isUploading ? 'Téléchargement en cours' : 'Télécharger les images'}
          </Button>
          
          {isUploading && (
            <Progress value={uploadProgress} className="h-2" />
          )}
        </div>

        {unmatched.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Images non associées ({unmatched.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {unmatched.map((file, index) => (
                <div key={`unmatched-${index}`} className="border rounded-lg p-3">
                  <div className="mb-2 h-24 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt={file.name}
                      className="max-h-full max-w-full"
                    />
                  </div>
                  <p className="text-xs font-medium truncate mb-1">{file.name}</p>
                  <select 
                    className="w-full text-xs p-1 border rounded"
                    onChange={(e) => {
                      const selectedIndex = parseInt(e.target.value);
                      if (selectedIndex >= 0) {
                        manuallyAssignFile(file, selectedIndex);
                      }
                    }}
                    defaultValue="-1"
                  >
                    <option value="-1">Associer à un joueur...</option>
                    {getSortedPlayerOptions().map((playerData, idx) => (
                      <option key={playerData.player.id} value={playerImages.findIndex(p => p.player.id === playerData.player.id)}>
                        {playerData.player.name} ({playerData.player.role})
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator className="my-4" />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="all">
              Tous les joueurs ({playerImages.length})
            </TabsTrigger>
            <TabsTrigger value="no-image">
              Sans image ({playersWithoutImages})
            </TabsTrigger>
            <TabsTrigger value="with-image">
              Avec image ({playerImages.length - playersWithoutImages})
            </TabsTrigger>
            <TabsTrigger value="pending">
              En attente ({playerImages.filter(p => p.imageFile && !p.processed).length})
            </TabsTrigger>
            <TabsTrigger value="processed">
              Traités ({playerImages.filter(p => p.processed).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="border rounded-lg p-3 flex items-center space-x-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredPlayers.sort((a, b) => 
                  a.player.name.localeCompare(b.player.name, 'fr', { sensitivity: 'base' })
                ).map((playerData) => (
                  <div 
                    key={playerData.player.id} 
                    className={`border rounded-lg p-3 flex items-center space-x-3 ${
                      playerData.processed 
                        ? 'border-green-300 bg-green-50' 
                        : playerData.imageFile 
                          ? 'border-blue-300 bg-blue-50' 
                          : !playerData.player.image
                            ? 'border-red-100 bg-red-50'
                            : 'border-gray-200'
                    }`}
                  >
                    <Avatar className="h-12 w-12 rounded-full overflow-hidden">
                      <AvatarImage 
                        src={playerData.newImageUrl || playerData.player.image} 
                        alt={playerData.player.name}
                        onError={(e) => {
                          console.error(`Error loading image for ${playerData.player.name}:`, e);
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = "/placeholder.svg";
                        }}
                      />
                      <AvatarFallback>{playerData.player.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{playerData.player.name}</p>
                      <p className="text-xs text-gray-500 truncate">{playerData.player.role}</p>
                      {playerData.player.image && (
                        <p className="text-xs text-gray-600 truncate" title={playerData.player.image}>
                          {playerData.player.image ? "Image URL: " + playerData.player.image.substring(0, 20) + "..." : "Pas d'image"}
                        </p>
                      )}
                      {!playerData.player.image && !playerData.newImageUrl && (
                        <p className="text-xs text-red-600">Pas d'image</p>
                      )}
                      {playerData.imageFile && !playerData.processed && (
                        <p className="text-xs text-blue-600">Nouvelle image sélectionnée</p>
                      )}
                      {playerData.processed && (
                        <p className="text-xs text-green-600">Téléchargée avec succès</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PlayerImagesImport;
