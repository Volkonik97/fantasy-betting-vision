
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayerWithImage } from "./types";
import { ImageIcon, XCircle, CheckCircle, Clock, AlertCircle, Images } from "lucide-react";

interface PlayerImagesFilterProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  playerImages: PlayerWithImage[];
  children: React.ReactNode;
}

const PlayerImagesFilter = ({ activeTab, setActiveTab, playerImages, children }: PlayerImagesFilterProps) => {
  const playersWithoutImages = playerImages.filter(p => !p.player.image && !p.newImageUrl).length;
  const playersWithImages = playerImages.filter(p => p.player.image || p.newImageUrl).length;
  const pendingCount = playerImages.filter(p => p.imageFile && !p.processed).length;
  const processedCount = playerImages.filter(p => p.processed).length;
  const errorCount = playerImages.filter(p => p.error !== null).length;

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-6 mb-4">
        <TabsTrigger value="all" className="flex items-center justify-center gap-1">
          <Images className="h-4 w-4" />
          <span className="hidden sm:inline">Tous</span> ({playerImages.length})
        </TabsTrigger>
        <TabsTrigger value="no-image" className="flex items-center justify-center gap-1">
          <XCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Sans image</span> ({playersWithoutImages})
        </TabsTrigger>
        <TabsTrigger value="with-image" className="flex items-center justify-center gap-1">
          <ImageIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Avec image</span> ({playersWithImages})
        </TabsTrigger>
        <TabsTrigger value="pending" className="flex items-center justify-center gap-1">
          <Clock className="h-4 w-4" />
          <span className="hidden sm:inline">En attente</span> ({pendingCount})
        </TabsTrigger>
        <TabsTrigger value="processed" className="flex items-center justify-center gap-1">
          <CheckCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Traités</span> ({processedCount})
        </TabsTrigger>
        <TabsTrigger 
          value="errors" 
          className={`flex items-center justify-center gap-1 ${errorCount > 0 ? "bg-red-100 data-[state=active]:bg-red-200" : ""}`}
        >
          <AlertCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Erreurs</span> ({errorCount})
        </TabsTrigger>
      </TabsList>

      <TabsContent value={activeTab} className="mt-2">
        {children}
      </TabsContent>
    </Tabs>
  );
};

export default PlayerImagesFilter;
