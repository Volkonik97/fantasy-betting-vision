
import React, { useState, useRef } from "react";
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

interface PlayerWithImage {
  player: Player;
  imageFile: File | null;
  newImageUrl: string | null;
  processed: boolean;
}

const PlayerImagesImport = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [playerImages, setPlayerImages] = useState<PlayerWithImage[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [unmatched, setUnmatched] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");

  // Load players when component mounts
  React.useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    setIsLoading(true);
    try {
      const playersList = await getPlayers();
      setPlayers(playersList);
      // Initialize player images array
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
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[^a-z0-9]/g, ""); // Remove special characters and spaces
  };

  const findMatchingPlayer = (fileName: string, playerImages: PlayerWithImage[]): number => {
    const normalizedFileName = normalizeString(fileName);
    
    // First try: exact match on normalized name
    const exactMatch = playerImages.findIndex(item => 
      normalizeString(item.player.name) === normalizedFileName
    );
    
    if (exactMatch !== -1) return exactMatch;
    
    // Second try: filename contains full player name
    const containsFullName = playerImages.findIndex(item => 
      normalizedFileName.includes(normalizeString(item.player.name))
    );
    
    if (containsFullName !== -1) return containsFullName;
    
    // Third try: player name contains filename
    const nameContainsFileName = playerImages.findIndex(item => 
      normalizeString(item.player.name).includes(normalizedFileName)
    );
    
    if (nameContainsFileName !== -1) return nameContainsFileName;
    
    // Fourth try: check each word in player name against filename
    for (let i = 0; i < playerImages.length; i++) {
      const playerName = playerImages[i].player.name;
      const playerWords = playerName.split(/\s+/);
      
      for (const word of playerWords) {
        if (word.length > 2) { // Only consider words longer than 2 characters
          const normalizedWord = normalizeString(word);
          if (normalizedFileName.includes(normalizedWord) || 
              normalizedWord.includes(normalizedFileName)) {
            return i;
          }
        }
      }
    }
    
    return -1; // No match found
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const files = Array.from(event.target.files);
    processFiles(files);
  };

  const processFiles = (files: File[]) => {
    // Create a copy of the current state
    const updatedPlayerImages = [...playerImages];
    const unmatchedFiles: File[] = [];
    
    files.forEach(file => {
      // Extract name from filename (remove extension)
      const fileName = file.name.toLowerCase().replace(/\.[^/.]+$/, "");
      
      // Find matching player using improved algorithm
      const playerIndex = findMatchingPlayer(fileName, updatedPlayerImages);
      
      if (playerIndex !== -1) {
        // Create object URL for preview
        const objectUrl = URL.createObjectURL(file);
        
        updatedPlayerImages[playerIndex] = {
          ...updatedPlayerImages[playerIndex],
          imageFile: file,
          newImageUrl: objectUrl
        };
      } else {
        // Add to unmatched files
        unmatchedFiles.push(file);
      }
    });
    
    setPlayerImages(updatedPlayerImages);
    setUnmatched(unmatchedFiles);
    
    if (unmatchedFiles.length > 0) {
      toast.warning(`${unmatchedFiles.length} images n'ont pas pu être associées à des joueurs`);
    }
  };

  // Sort players alphabetically for the dropdown
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
    
    // Remove from unmatched list
    setUnmatched(prev => prev.filter(f => f !== file));
  };

  const uploadImages = async () => {
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
    
    for (const playerData of playersToUpdate) {
      try {
        if (!playerData.imageFile) continue;
        
        const playerId = playerData.player.id;
        const file = playerData.imageFile;
        
        // Upload file to Supabase Storage
        const fileName = `${playerId}_${Date.now()}.${file.name.split('.').pop()}`;
        
        // Upload file
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('player-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true
          });
        
        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          toast.error(`Erreur lors du téléchargement de l'image pour ${playerData.player.name}`);
          continue;
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabase
          .storage
          .from('player-images')
          .getPublicUrl(fileName);
        
        // Update player record in database
        const { error: updateError } = await supabase
          .from('players')
          .update({ image: publicUrl })
          .eq('id', playerId);
        
        if (updateError) {
          console.error("Error updating player:", updateError);
          toast.error(`Erreur lors de la mise à jour du joueur ${playerData.player.name}`);
          continue;
        }
        
        // Update local state
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
      } finally {
        processed++;
        setUploadProgress(Math.round((processed / total) * 100));
      }
    }
    
    setPlayerImages(updatedPlayerImages);
    setIsUploading(false);
    
    if (successCount > 0) {
      toast.success(`${successCount} images de joueurs téléchargées avec succès`);
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

  // Filter players based on the active tab
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
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File upload area */}
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileSelect} 
            multiple 
            accept="image/*" 
          />
          <div className="flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm font-medium mb-1">Cliquez ou déposez des fichiers ici</p>
            <p className="text-xs text-gray-500">PNG, JPG ou WEBP jusqu'à 5MB</p>
          </div>
        </div>

        {/* Upload button with progress */}
        <div className="space-y-2">
          <Button 
            onClick={uploadImages} 
            className="w-full" 
            disabled={isUploading || playerImages.filter(p => p.imageFile !== null).length === 0}
          >
            {isUploading ? 'Téléchargement en cours' : 'Télécharger les images'}
          </Button>
          
          {isUploading && (
            <Progress value={uploadProgress} className="h-2" />
          )}
        </div>

        {/* Unmatched files section */}
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

        {/* Filter tabs for players */}
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
            {/* Players preview */}
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
                      />
                      <AvatarFallback>{playerData.player.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{playerData.player.name}</p>
                      <p className="text-xs text-gray-500 truncate">{playerData.player.role}</p>
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
