
import React from "react";
import { PlayerWithImage } from "./types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { hasPlayerImage } from "./types";

interface PlayerImagesFilterProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  playerImages: PlayerWithImage[];
  children: React.ReactNode;
}

const PlayerImagesFilter: React.FC<PlayerImagesFilterProps> = ({ 
  activeTab, 
  setActiveTab, 
  playerImages,
  children 
}) => {
  // Count players for each category
  const countAll = playerImages.length;
  const countNoImage = playerImages.filter(p => !hasPlayerImage(p.player) && !p.newImageUrl).length;
  const countWithImage = playerImages.filter(p => hasPlayerImage(p.player) || p.newImageUrl).length;
  const countPending = playerImages.filter(p => p.imageFile && !p.processed).length;
  const countProcessed = playerImages.filter(p => p.processed).length;
  const countErrors = playerImages.filter(p => p.error !== null).length;

  return (
    <div>
      <div className="mb-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 sm:grid-cols-6">
            <TabsTrigger value="all" className="relative">
              Tous
              <Badge variant="outline" className="ml-1">{countAll}</Badge>
            </TabsTrigger>
            
            <TabsTrigger value="no-image" className="relative">
              Sans image
              <Badge variant="outline" className="ml-1">{countNoImage}</Badge>
            </TabsTrigger>
            
            <TabsTrigger value="with-image" className="relative">
              Avec image
              <Badge variant="outline" className="ml-1">{countWithImage}</Badge>
            </TabsTrigger>
            
            <TabsTrigger value="pending" className="relative">
              À télécharger
              {countPending > 0 && (
                <Badge variant="outline" className="ml-1 bg-blue-50 text-blue-800">{countPending}</Badge>
              )}
            </TabsTrigger>
            
            <TabsTrigger value="processed" className="relative">
              Traités
              {countProcessed > 0 && (
                <Badge variant="outline" className="ml-1 bg-green-50 text-green-800">{countProcessed}</Badge>
              )}
            </TabsTrigger>
            
            <TabsTrigger value="errors" className="relative">
              Erreurs
              {countErrors > 0 && (
                <Badge variant="outline" className="ml-1 bg-red-50 text-red-800">{countErrors}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {children}
    </div>
  );
};

export default PlayerImagesFilter;
