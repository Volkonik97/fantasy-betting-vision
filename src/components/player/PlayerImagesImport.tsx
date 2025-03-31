
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const files = Array.from(event.target.files);
    processFiles(files);
  };

  const processFiles = (files: File[]) => {
    // Create a copy of the current state
    const updatedPlayerImages = [...playerImages];
    
    files.forEach(file => {
      // Try to match player name from filename
      const fileName = file.name.toLowerCase().replace(/\.[^/.]+$/, ""); // Remove extension
      
      // Find matching player
      const playerIndex = updatedPlayerImages.findIndex(item => {
        const playerName = item.player.name.toLowerCase();
        return fileName.includes(playerName) || 
               playerName.includes(fileName) ||
               // Try with no spaces in player name
               fileName.includes(playerName.replace(/\s/g, "")) ||
               playerName.replace(/\s/g, "").includes(fileName);
      });
      
      if (playerIndex !== -1) {
        // Create object URL for preview
        const objectUrl = URL.createObjectURL(file);
        
        updatedPlayerImages[playerIndex] = {
          ...updatedPlayerImages[playerIndex],
          imageFile: file,
          newImageUrl: objectUrl
        };
      }
    });
    
    setPlayerImages(updatedPlayerImages);
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
    
    for (const playerData of playersToUpdate) {
      try {
        if (!playerData.imageFile) continue;
        
        const playerId = playerData.player.id;
        const file = playerData.imageFile;
        
        // Upload file to Supabase Storage
        const fileName = `${playerId}_${Date.now()}.${file.name.split('.').pop()}`;
        
        // First check if storage bucket exists, create if not
        const { data: buckets } = await supabase.storage.listBuckets();
        if (!buckets?.find(bucket => bucket.name === 'player-images')) {
          await supabase.storage.createBucket('player-images', { 
            public: true,
            fileSizeLimit: 5242880 // 5MB
          });
        }
        
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
        
      } catch (error) {
        console.error("Error processing player image:", error);
      } finally {
        processed++;
        setUploadProgress(Math.round((processed / total) * 100));
      }
    }
    
    setPlayerImages(updatedPlayerImages);
    setIsUploading(false);
    
    if (processed > 0) {
      toast.success(`${processed} images de joueurs téléchargées avec succès`);
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

        {/* Upload button */}
        <Button 
          onClick={uploadImages} 
          className="w-full" 
          disabled={isUploading || playerImages.filter(p => p.imageFile !== null).length === 0}
        >
          {isUploading ? `Téléchargement en cours (${uploadProgress}%)` : 'Télécharger les images'}
        </Button>

        <Separator className="my-4" />

        {/* Players preview */}
        {isLoading ? (
          <div className="text-center py-4">
            <p className="text-gray-500">Chargement des joueurs...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {playerImages.map((playerData) => (
              <div 
                key={playerData.player.id} 
                className={`border rounded-lg p-3 flex items-center space-x-3 ${playerData.processed ? 'border-green-300 bg-green-50' : playerData.imageFile ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}
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
                  {playerData.imageFile && (
                    <p className="text-xs text-blue-600">Nouvel image sélectionné</p>
                  )}
                  {playerData.processed && (
                    <p className="text-xs text-green-600">Téléchargé avec succès</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlayerImagesImport;
