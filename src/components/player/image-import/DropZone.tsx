
import React, { useRef } from "react";

interface DropZoneProps {
  onFileSelect: (files: File[]) => void;
  disabled: boolean;
}

const DropZone = ({ onFileSelect, disabled }: DropZoneProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onFileSelect(Array.from(event.target.files));
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors ${
        disabled ? 'border-red-300 bg-red-50 opacity-50' : 'border-gray-300'
      }`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={triggerFileInput}
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
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-sm font-medium mb-1">Cliquez ou déposez des fichiers ici</p>
        <p className="text-xs text-gray-500">PNG, JPG ou WEBP jusqu'à 5MB</p>
      </div>
    </div>
  );
};

export default DropZone;
