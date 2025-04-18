
import React from "react";

interface PlayerStatsProps {
  kda: number | string;
  csPerMin: number | string;
  damageShare: number | string;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ kda, csPerMin, damageShare }) => {
  // Formatage du damageShare exactement comme dans PlayerHeader
  const formatDamageShare = (value: number | string) => {
    // Log de débogage pour voir la valeur avant traitement
    console.log(`PlayerStats: formatting damageShare input:`, value, `type:`, typeof value);
    
    try {
      // Conversion en chaîne pour manipulation sécurisée
      const valueAsString = String(value || '0');
      console.log(`PlayerStats: valueAsString:`, valueAsString);
      
      // Enlever les signes de pourcentage éventuels
      const cleanedValue = valueAsString.replace(/%/g, '');
      console.log(`PlayerStats: cleanedValue:`, cleanedValue);
      
      // Conversion en nombre pour manipulation
      let numericValue = parseFloat(cleanedValue);
      console.log(`PlayerStats: parsed numericValue:`, numericValue);
      
      // Si c'est NaN, retourner 0%
      if (isNaN(numericValue)) {
        return '0%';
      }
      
      // Si c'est un décimal entre 0-1, le convertir en pourcentage (0-100)
      if (numericValue >= 0 && numericValue <= 1) {
        numericValue = numericValue * 100;
      }
      
      // Arrondir et formater
      return `${Math.round(numericValue)}%`;
    } catch (error) {
      console.error("Error formatting damage share:", error);
      return '0%';
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
      <div>
        <p className="font-semibold">{typeof kda === 'number' ? kda.toFixed(1) : kda || '0.0'}</p>
        <p className="text-xs text-gray-500">KDA</p>
      </div>
      <div>
        <p className="font-semibold">{typeof csPerMin === 'number' ? csPerMin.toFixed(1) : csPerMin || '0.0'}</p>
        <p className="text-xs text-gray-500">CS/min</p>
      </div>
      <div>
        <p className="font-semibold">{formatDamageShare(damageShare)}</p>
        <p className="text-xs text-gray-500">DMG%</p>
      </div>
    </div>
  );
};

export default PlayerStats;
