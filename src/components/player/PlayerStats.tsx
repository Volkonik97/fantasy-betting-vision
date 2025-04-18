
import React from "react";

interface PlayerStatsProps {
  kda: number | string;
  csPerMin: number | string;
  damageShare: number | string;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ kda, csPerMin, damageShare }) => {
  // Amélioration de la gestion du pourcentage de dégâts avec la même technique que dans PlayerHeader
  const formatDamageShare = (value: number | string) => {
    // Log de débogage
    console.log(`PlayerStats: formatting damageShare value:`, value, `of type:`, typeof value);
    
    try {
      // Étape 1: Convertir en string pour manipulation sécurisée
      let valueAsString = String(value || '0');
      
      // Étape 2: Nettoyer la chaîne (enlever les %)
      valueAsString = valueAsString.replace(/%/g, '');
      
      // Étape 3: Convertir en nombre
      let numericValue = parseFloat(valueAsString);
      
      console.log(`PlayerStats: parsed damageShare value:`, numericValue);
      
      // Étape 4: Validation et formatage
      if (isNaN(numericValue)) {
        return '0%';
      }
      
      // Étape 5: Ajustement des décimales (0-1) en pourcentage (0-100)
      if (numericValue >= 0 && numericValue <= 1) {
        numericValue = numericValue * 100;
      }
      
      // Étape 6: Arrondir et formater
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
