
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ImageWithFallbackProps {
  src: string | null | undefined;
  alt: string;
  fallback?: React.ReactNode;
  className?: string;
  skeletonClassName?: string;
  width?: number;
  height?: number;
  onLoad?: () => void;
  onError?: () => void;
}

const ImageWithFallback = ({
  src,
  alt,
  fallback,
  className,
  skeletonClassName,
  width,
  height,
  onLoad,
  onError,
}: ImageWithFallbackProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Display a skeleton while loading
  if (isLoading) {
    return (
      <div className="relative w-full h-full">
        <Skeleton 
          className={cn("w-full h-full", skeletonClassName)} 
        />
        {src && (
          <img
            src={src}
            alt={alt}
            className="hidden"
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
      </div>
    );
  }

  // Display the fallback if there's an error or no source
  if (hasError || !src) {
    return (
      <div className={cn("flex items-center justify-center w-full h-full", className)}>
        {fallback || (
          <div className="bg-gray-100 flex items-center justify-center w-full h-full">
            <span className="text-gray-400 text-lg font-medium">{alt.charAt(0)}</span>
          </div>
        )}
      </div>
    );
  }

  // Display the image
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
    />
  );
};

export default ImageWithFallback;
