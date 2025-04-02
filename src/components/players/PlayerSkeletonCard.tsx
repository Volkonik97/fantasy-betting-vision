
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const PlayerSkeletonCard = () => {
  return (
    <div className="bg-white rounded-lg shadow-subtle border border-gray-100 overflow-hidden h-full">
      <div className="relative">
        <Skeleton className="w-full h-40" />
        <div className="absolute top-2 right-2">
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
      </div>
      
      <div className="p-4">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-4" />
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerSkeletonCard;
