
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayerWithImage } from "./types";

interface PlayerImagesFilterProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  playerImages: PlayerWithImage[];
  children: React.ReactNode;
}

const PlayerImagesFilter = ({ activeTab, setActiveTab, playerImages, children }: PlayerImagesFilterProps) => {
  const playersWithoutImages = playerImages.filter(p => !p.player.image && !p.newImageUrl).length;
  const pendingCount = playerImages.filter(p => p.imageFile && !p.processed).length;
  const processedCount = playerImages.filter(p => p.processed).length;

  return (
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
          En attente ({pendingCount})
        </TabsTrigger>
        <TabsTrigger value="processed">
          Traités ({processedCount})
        </TabsTrigger>
      </TabsList>

      <TabsContent value={activeTab}>
        {children}
      </TabsContent>
    </Tabs>
  );
};

export default PlayerImagesFilter;
