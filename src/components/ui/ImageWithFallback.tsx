
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
  forceRefresh?: boolean;
  lazy?: boolean;
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
  lazy = true,
}: ImageWithFallbackProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(!src);

  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    if (onError) onError();
  };

  // Si pas d'image source, montrer le fallback immédiatement
  if (!src || hasError) {
    return (
      <div className={cn("flex items-center justify-center w-full h-full", className)}>
        {fallback || (
          <div className="bg-gray-100 flex items-center justify-center w-full h-full">
            <span className="text-gray-400 text-lg font-medium">{alt.charAt(0).toUpperCase()}</span>
          </div>
        )}
      </div>
    );
  }

  // En cas de chargement, afficher un skeleton
  if (isLoading) {
    return (
      <div className="relative w-full h-full">
        <Skeleton 
          className={cn("w-full h-full", skeletonClassName)} 
        />
        <img
          src={src}
          alt={alt}
          className="hidden"
          loading={lazy ? "lazy" : "eager"}
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>
    );
  }

  // Afficher l'image
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={lazy ? "lazy" : "eager"}
      onError={handleError}
    />
  );
};

export default ImageWithFallback;
