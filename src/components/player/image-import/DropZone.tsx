
import React, { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { ImageIcon, Upload, FileUp } from "lucide-react";
import { motion } from "framer-motion";

interface DropZoneProps {
  onDrop: (files: File[]) => void;
  disabled?: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({ onDrop, disabled = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files).filter(
        file => file.type.startsWith('image/')
      );
      
      if (filesArray.length > 0) {
        onDrop(filesArray);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || !e.target.files || e.target.files.length === 0) return;
    
    const filesArray = Array.from(e.target.files).filter(
      file => file.type.startsWith('image/')
    );
    
    if (filesArray.length > 0) {
      onDrop(filesArray);
    }
    
    // Reset the file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card 
      className={`
        border-2 border-dashed rounded-lg p-6
        ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300'} 
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-500 hover:bg-blue-50'}
        transition-colors duration-200
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <div className="flex flex-col items-center justify-center space-y-2 text-center">
        <motion.div 
          className="p-3 rounded-full bg-blue-100"
          animate={{ 
            scale: isDragging ? [1, 1.1, 1] : 1,
            rotate: isDragging ? [0, -5, 5, -5, 0] : 0
          }}
          transition={{ 
            duration: isDragging ? 1.5 : 0.3, 
            repeat: isDragging ? Infinity : 0
          }}
        >
          {isDragging ? (
            <FileUp className="h-6 w-6 text-blue-600" />
          ) : (
            <ImageIcon className="h-6 w-6 text-blue-600" />
          )}
        </motion.div>
        
        <div className="space-y-2">
          <p className="font-medium text-sm">
            {isDragging 
              ? 'Déposez les images ici'
              : 'Glissez des images ou cliquez pour parcourir'
            }
          </p>
          <p className="text-xs text-gray-500">
            Formats acceptés: JPG, PNG, GIF, WEBP
          </p>
          <p className="text-xs text-gray-500">
            <strong>Astuce:</strong> Pour associer automatiquement, nommez vos fichiers avec les noms des joueurs
          </p>
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />
    </Card>
  );
};

export default DropZone;
