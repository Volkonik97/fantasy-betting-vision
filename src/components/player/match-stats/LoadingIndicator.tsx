
import React from "react";

const LoadingIndicator: React.FC = () => {
  return (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-lol-blue mx-auto"></div>
      <p className="mt-2 text-gray-500">Chargement des données...</p>
    </div>
  );
};

export default LoadingIndicator;
