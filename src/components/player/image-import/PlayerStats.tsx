
import React from "react";
import { PlayerWithImage } from "./types";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ImageIcon, XCircle, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface PlayerStatsProps {
  players: PlayerWithImage[];
  className?: string;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ players, className = "" }) => {
  const totalPlayers = players.length;
  const playersWithImages = players.filter(p => p.player.image || p.newImageUrl).length;
  const playersWithoutImages = totalPlayers - playersWithImages;
  const pendingUploads = players.filter(p => p.imageFile && !p.processed).length;
  const uploadedImages = players.filter(p => p.processed).length;
  const errorCount = players.filter(p => p.error !== null).length;
  
  const coveragePercentage = totalPlayers > 0 
    ? Math.round((playersWithImages / totalPlayers) * 100) 
    : 0;

  return (
    <Card className={`shadow-sm ${className}`}>
      <CardContent className="pt-6 pb-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Statistiques des images</h3>
            <span className="text-sm text-gray-500">{playersWithImages} / {totalPlayers} joueurs</span>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Couverture</span>
              <span className="font-medium">{coveragePercentage}%</span>
            </div>
            <Progress value={coveragePercentage} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="flex items-center gap-2 text-sm">
              <ImageIcon className="h-4 w-4 text-blue-500" />
              <span>Total joueurs:</span>
              <span className="font-medium ml-auto">{totalPlayers}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Avec image:</span>
              <span className="font-medium ml-auto">{playersWithImages}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <XCircle className="h-4 w-4 text-red-500" />
              <span>Sans image:</span>
              <span className="font-medium ml-auto">{playersWithoutImages}</span>
            </div>
            
            {pendingUploads > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-amber-500" />
                <span>En attente:</span>
                <span className="font-medium ml-auto">{pendingUploads}</span>
              </div>
            )}
            
            {uploadedImages > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Téléchargées:</span>
                <span className="font-medium ml-auto">{uploadedImages}</span>
              </div>
            )}
            
            {errorCount > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span>Erreurs:</span>
                <span className="font-medium ml-auto">{errorCount}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerStats;
