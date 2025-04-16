
import React, { useRef, useState } from "react";
import { CloudUpload, Upload } from "lucide-react";

interface DropZoneProps {
  onFileSelect: (files: File[]) => void;
  disabled: boolean;
}

const DropZone = ({ onFileSelect, disabled }: DropZoneProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (!disabled && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onFileSelect(Array.from(event.target.files));
      
      // Réinitialiser l'input pour permettre la sélection du même fichier
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
        ${isDragging ? 'bg-blue-50 border-blue-300' : ''}
        ${disabled ? 'border-red-300 bg-red-50 opacity-50 cursor-not-allowed' : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400'}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={disabled ? undefined : triggerFileInput}
      style={{ pointerEvents: disabled ? 'none' : 'auto' }}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileSelect} 
        multiple 
        accept="image/*" 
        disabled={disabled}
      />
      <div className="flex flex-col items-center">
        <div className="mb-3 h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
          {isDragging ? (
            <CloudUpload className="h-8 w-8 text-blue-500" />
          ) : (
            <Upload className="h-8 w-8" />
          )}
        </div>
        <p className="text-sm font-medium mb-2">{isDragging ? 'Déposez les fichiers ici' : 'Cliquez ou déposez des fichiers ici'}</p>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          Formats acceptés: PNG, JPG ou WEBP jusqu'à 5MB. 
          <br />Les noms de fichiers seront utilisés pour associer les images aux joueurs.
        </p>
      </div>
    </div>
  );
};

export default DropZone;
