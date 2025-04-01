
import React, { useState, useEffect } from "react";
import { Player } from "@/utils/models/types";
import { motion } from "framer-motion";
import { verifyImageExists } from "@/utils/database/teams/imageUtils";

interface PlayerCardProps {
  player: Player & { teamName?: string; teamRegion?: string };
}

const PlayerCard = ({ player }: PlayerCardProps) => {
  const [imageValid, setImageValid] = useState<boolean | null>(null);
  const [isCheckingImage, setIsCheckingImage] = useState(false);
  
  useEffect(() => {
    // Verify image if it exists and hasn't been verified yet
    if (player.image && imageValid === null && !isCheckingImage) {
      setIsCheckingImage(true);
      
      const checkImage = async () => {
        try {
          const isValid = await verifyImageExists(player.image!);
          setImageValid(isValid);
        } catch (error) {
          console.error(`Error verifying image for ${player.name}:`, error);
          setImageValid(false);
        } finally {
          setIsCheckingImage(false);
        }
      };
      
      checkImage();
    } else if (!player.image) {
      setImageValid(false);
    }
  }, [player.image, imageValid, isCheckingImage]);
  
  const getRoleColor = (role: string) => {
    switch (role) {
      case "Top":
        return "bg-yellow-100 text-yellow-800";
      case "Jungle":
        return "bg-green-100 text-green-800";
      case "Mid":
        return "bg-blue-100 text-blue-800";
      case "ADC":
        return "bg-red-100 text-red-800";
      case "Support":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Ensure championPool is an array
  const championPoolArray = Array.isArray(player.championPool) 
    ? player.championPool 
    : typeof player.championPool === 'string' 
      ? player.championPool.split(',').map(c => c.trim()).filter(c => c) 
      : [];

  // Format KDA value
  const formattedKDA = typeof player.kda === 'number' 
    ? player.kda.toFixed(1) 
    : typeof player.kda === 'string' 
      ? parseFloat(player.kda).toFixed(1) 
      : '0.0';

  // Format CS per minute
  const formattedCsPerMin = typeof player.csPerMin === 'number' 
    ? player.csPerMin.toFixed(1) 
    : typeof player.csPerMin === 'string' 
      ? parseFloat(player.csPerMin).toFixed(1) 
      : '0.0';

  // Format damage share percentage
  const formattedDamageShare = typeof player.damageShare === 'number' 
    ? Math.round(player.damageShare * 100) 
    : typeof player.damageShare === 'string' 
      ? Math.round(parseFloat(player.damageShare) * 100) 
      : 0;

  // Display the team name directly from the player object if available
  const teamName = player.teamName || player.team;
  
  // Check for valid image based on our state check
  const hasValidImageUrl = player.image && imageValid !== false;
  
  return (
    <div className="h-full">
      <motion.div 
        className="bg-white rounded-xl border border-gray-100 shadow-subtle overflow-hidden hover:shadow-md transition-shadow duration-300 h-full flex flex-col"
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
      >
        <div className="h-36 relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 flex-shrink-0">
          {hasValidImageUrl ? (
            <img 
              src={player.image} 
              alt={player.name} 
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                console.error(`Error loading image for ${player.name}:`, e);
                const target = e.target as HTMLImageElement;
                target.onerror = null; // Prevent infinite error loop
                setImageValid(false); // Mark image as invalid
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-4xl font-bold text-gray-300">{player.name.charAt(0)}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
        </div>
        
        <div className="p-4 -mt-5 relative flex flex-col h-full">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-medium text-lg">{player.name}</h3>
              <span className="text-sm text-gray-500 block">
                {teamName}
              </span>
            </div>
            
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getRoleColor(player.role)}`}>
              {player.role}
            </span>
          </div>
          
          {/* Stats section with fixed height and consistent spacing */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded-md h-16 flex flex-col justify-center">
              <span className="text-xs text-gray-500 mb-1">KDA</span>
              <span className="font-semibold text-sm">{formattedKDA}</span>
            </div>
            
            <div className="text-center p-2 bg-gray-50 rounded-md h-16 flex flex-col justify-center">
              <span className="text-xs text-gray-500 mb-1">CS/Min</span>
              <span className="font-semibold text-sm">{formattedCsPerMin}</span>
            </div>
            
            <div className="text-center p-2 bg-gray-50 rounded-md h-16 flex flex-col justify-center">
              <span className="text-xs text-gray-500 mb-1">DMG</span>
              <span className="font-semibold text-sm">{formattedDamageShare}%</span>
            </div>
          </div>
          
          {/* Redesigned champion pool with fixed width badges */}
          <div className="mt-auto">
            <span className="text-xs text-gray-500 block mb-2">Champion Pool</span>
            <div className="flex flex-wrap gap-1">
              {championPoolArray.length > 0 ? (
                championPoolArray.slice(0, 3).map((champion, index) => (
                  <span 
                    key={index}
                    className="w-[68px] py-1 bg-blue-50 text-blue-700 text-xs text-center rounded"
                    title={champion}
                  >
                    {champion.substring(0, 5)}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400">Aucun champion</span>
              )}
              {championPoolArray.length > 3 && (
                <span className="w-[30px] py-1 bg-gray-50 text-gray-500 text-xs text-center rounded">
                  +{championPoolArray.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PlayerCard;
