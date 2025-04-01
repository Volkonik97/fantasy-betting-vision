
import React from "react";

const LoadingIndicator = () => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center space-x-4">
        <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse"></div>
        <div className="space-y-2">
          <div className="h-4 w-48 bg-gray-200 animate-pulse"></div>
          <div className="h-4 w-64 bg-gray-200 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;
