
import React from "react";

interface PlayerStatsProps {
  kda: number | string;
  csPerMin: number | string;
  damageShare: number | string;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({ kda, csPerMin, damageShare }) => {
  // Amélioration de la gestion du pourcentage de dégâts
  const formatDamageShare = (value: number | string) => {
    // Add debug logs to trace value before processing
    console.log(`PlayerStats: formatting damageShare value:`, value, `of type:`, typeof value);
    
    // Conversion en nombre
    const numValue = typeof value === 'string' 
      ? parseFloat(value.replace('%', '')) 
      : value;

    console.log(`PlayerStats: converted damageShare value:`, numValue);

    // Validation du nombre
    if (isNaN(numValue)) return '0%';

    // Si la valeur est entre 0 et 1, la convertir en pourcentage
    if (numValue >= 0 && numValue <= 1) {
      return `${Math.round(numValue * 100)}%`;
    }

    // Si la valeur est déjà un pourcentage
    if (numValue >= 0 && numValue <= 100) {
      return `${Math.round(numValue)}%`;
    }

    // Fallback
    return '0%';
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
