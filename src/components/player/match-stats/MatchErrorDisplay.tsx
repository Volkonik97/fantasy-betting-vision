
import React from "react";
import { AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MatchErrorDisplayProps {
  errors: Record<string, string>;
}

const MatchErrorDisplay: React.FC<MatchErrorDisplayProps> = ({ errors }) => {
  if (Object.keys(errors).length === 0) {
    return null;
  }

  return (
    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
      <div className="flex items-start">
        <AlertCircle className="text-amber-500 mr-2 flex-shrink-0 mt-0.5" size={18} />
        <div>
          <p className="text-amber-700 text-sm font-medium">
            Certains matchs n'ont pas pu être correctement chargés ({Object.keys(errors).length} erreurs)
          </p>
          <details className="mt-1">
            <summary className="text-xs text-amber-600 cursor-pointer">
              Voir les détails
            </summary>
            <div className="mt-2 text-xs text-amber-800 max-h-40 overflow-y-auto">
              <ul className="list-disc pl-5">
                {Object.entries(errors).map(([matchId, error]) => (
                  <li key={matchId}>
                    Match {matchId}: {error}
                  </li>
                ))}
              </ul>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default MatchErrorDisplay;
