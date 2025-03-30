
import React from "react";
import { AlertCircle } from "lucide-react";

const DataFormatInfo = () => {
  return (
    <div className="border rounded-lg p-4 bg-amber-50">
      <div className="flex items-start">
        <AlertCircle className="text-amber-500 mr-3 mt-1" size={20} />
        <div>
          <h3 className="font-medium text-amber-800">Format des données</h3>
          <p className="text-sm text-amber-700 mt-1">
            L'importation supporte deux formats:
          </p>
          <ul className="list-disc list-inside mt-2 text-sm text-amber-700">
            <li>
              <strong>Format standard:</strong> Un document avec trois onglets nommés "teams", "players" et "matches"
            </li>
            <li>
              <strong>Format Oracle's Elixir:</strong> Un document avec un seul onglet au format Oracle's Elixir (recommandé)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DataFormatInfo;
