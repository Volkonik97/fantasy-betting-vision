
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Database } from "lucide-react";

interface DataImportFormProps {
  sheetsUrl: string;
  setSheetsUrl: (url: string) => void;
  deleteExisting: boolean;
  setDeleteExisting: (value: boolean) => void;
  hasDataInDb: boolean;
  isLoading: boolean;
  handleSheetImport: () => void;
}

const DataImportForm: React.FC<DataImportFormProps> = ({
  sheetsUrl,
  setSheetsUrl,
  deleteExisting,
  setDeleteExisting,
  hasDataInDb,
  isLoading,
  handleSheetImport
}) => {
  return (
    <>
      {hasDataInDb && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center text-blue-700">
            <Database className="mr-2 h-5 w-5" />
            <p className="text-sm font-medium">
              Les données sont stockées dans Supabase.
            </p>
          </div>
          
          <div className="flex items-center mt-2">
            <Checkbox 
              id="deleteExisting" 
              checked={deleteExisting} 
              onCheckedChange={(checked) => setDeleteExisting(checked as boolean)}
              className="mr-2"
            />
            <label htmlFor="deleteExisting" className="text-sm cursor-pointer text-blue-700">
              Supprimer les données existantes avant l'importation
            </label>
          </div>
        </div>
      )}
      
      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-2">URL Google Sheets</h3>
        <p className="text-sm text-gray-500 mb-4">
          Entrez l'URL d'un document Google Sheets contenant les données au format Oracle's Elixir
        </p>
        <div className="space-y-4">
          <Input
            type="url"
            placeholder="https://docs.google.com/spreadsheets/d/..."
            value={sheetsUrl}
            onChange={(e) => setSheetsUrl(e.target.value)}
          />
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Conseil:</strong> Pour les données au format Oracle's Elixir avec toutes les colonnes 
              (gameid, league, year, split, playername, teamname, etc.), l'importation Google Sheets 
              offre la meilleure compatibilité.
            </p>
          </div>
          
          <Button 
            className="w-full" 
            onClick={handleSheetImport} 
            disabled={!sheetsUrl || isLoading}
          >
            {isLoading ? (
              <>Importation en cours...</>
            ) : (
              <>
                <Link className="mr-2 h-4 w-4" />
                Importer depuis Google Sheets
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
};

export default DataImportForm;
