
import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePlayerImageUpload } from "./image-import/usePlayerImageUpload";
import { hasPlayerImage } from "./image-import/types";

interface PlayerImagesImportProps {
  bucketStatus?: "loading" | "exists" | "error";
  rlsEnabled?: boolean;
  showRlsHelp?: () => void;
}

const PlayerImagesImport = ({
  bucketStatus = "loading",
  rlsEnabled = false,
  showRlsHelp = () => {}
}: PlayerImagesImportProps) => {
  const { 
    players, 
    isLoading, 
    loadPlayers, 
    uploadPlayerImage, 
    assignImageToPlayer 
  } = usePlayerImageUpload();

  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  const handleFileUpload = async () => {
    const playersToUpload = players.filter(p => p.file);
    for (const playerUpload of playersToUpload) {
      await uploadPlayerImage(playerUpload);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="space-y-4 p-6">
        <h2 className="text-xl font-bold mb-4">Importer des images de joueurs</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((playerUpload, index) => (
            <div 
              key={playerUpload.player.id} 
              className="border rounded-lg p-4 flex flex-col items-center"
            >
              <img 
                src={playerUpload.url || playerUpload.player.image || '/placeholder.png'} 
                alt={playerUpload.player.name}
                className="w-32 h-32 object-cover rounded-full mb-4"
              />
              <h3 className="text-md font-semibold mb-2">{playerUpload.player.name}</h3>
              
              <div className="flex items-center space-x-2">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      assignImageToPlayer(file, index);
                    }
                  }}
                  className="hidden"
                  id={`file-${playerUpload.player.id}`}
                />
                <label 
                  htmlFor={`file-${playerUpload.player.id}`} 
                  className="cursor-pointer bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Choisir une image
                </label>
                
                {playerUpload.file && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => uploadPlayerImage(playerUpload)}
                    disabled={playerUpload.status === 'uploading'}
                  >
                    {playerUpload.status === 'uploading' ? 'En cours...' : 'Télécharger'}
                  </Button>
                )}
              </div>
              
              {playerUpload.error && (
                <p className="text-red-500 text-sm mt-2">{playerUpload.error}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerImagesImport;
