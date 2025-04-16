
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayerWithImage } from "./types";
import { ImageIcon, XCircle, CheckCircle, Clock, AlertCircle, Images } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
          <span className="hidden sm:inline">Tous</span>
          <Badge variant="outline" className="ml-1 py-0 px-1.5">{playerImages.length}</Badge>
        </TabsTrigger>
        <TabsTrigger value="no-image" className="flex items-center justify-center gap-1">
          <XCircle className="h-4 w-4 text-red-500" />
          <span className="hidden sm:inline">Sans image</span>
          <Badge variant="outline" className="ml-1 py-0 px-1.5">{playersWithoutImages}</Badge>
        </TabsTrigger>
        <TabsTrigger value="with-image" className="flex items-center justify-center gap-1">
          <ImageIcon className="h-4 w-4 text-blue-500" />
          <span className="hidden sm:inline">Avec image</span>
          <Badge variant="outline" className="ml-1 py-0 px-1.5">{playersWithImages}</Badge>
        </TabsTrigger>
        <TabsTrigger value="pending" className="flex items-center justify-center gap-1">
          <Clock className="h-4 w-4 text-amber-500" />
          <span className="hidden sm:inline">En attente</span>
          <Badge variant="outline" className="ml-1 py-0 px-1.5">{pendingCount}</Badge>
        </TabsTrigger>
        <TabsTrigger value="processed" className="flex items-center justify-center gap-1">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="hidden sm:inline">Traités</span>
          <Badge variant="outline" className="ml-1 py-0 px-1.5">{processedCount}</Badge>
        </TabsTrigger>
        <TabsTrigger 
          value="errors" 
          className={`flex items-center justify-center gap-1 ${errorCount > 0 ? "bg-red-100 data-[state=active]:bg-red-200" : ""}`}
        >
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="hidden sm:inline">Erreurs</span>
          <Badge variant={errorCount > 0 ? "destructive" : "outline"} className="ml-1 py-0 px-1.5">{errorCount}</Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value={activeTab} className="mt-2">
        {children}
      </TabsContent>
    </Tabs>
  );
};

export default PlayerImagesFilter;
