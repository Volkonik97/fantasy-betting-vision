
import React, { useState, useEffect } from "react";
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
  forceRefresh = false,
}: ImageWithFallbackProps) => {
  const [isLoading, setIsLoading] = useState(!!src); // Only show loading if there's a src
  const [hasError, setHasError] = useState(false);
  
  // Add a timestamp parameter for cache busting when forceRefresh is true
  const [imgSrc, setImgSrc] = useState<string | null | undefined>(
    forceRefresh && src ? `${src}?t=${Date.now()}` : src
  );
  
  // Update the image source when the src prop changes
  useEffect(() => {
    if (forceRefresh && src) {
      setImgSrc(`${src}?t=${Date.now()}`);
    } else {
      setImgSrc(src);
    }
    
    if (src) {
      setIsLoading(true);
      setHasError(false);
    }
  }, [src, forceRefresh]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
    
    // If image fails to load and we have a source, try once more with cache busting
    if (src && !forceRefresh) {
      setImgSrc(`${src}?t=${Date.now()}`);
    }
  };

  // If there's no source, show fallback immediately without loading state
  if (!imgSrc) {
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

  // Display a skeleton while loading
  if (isLoading) {
    return (
      <div className="relative w-full h-full">
        <Skeleton 
          className={cn("w-full h-full", skeletonClassName)} 
        />
        <img
          src={imgSrc}
          alt={alt}
          className="hidden"
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>
    );
  }

  // Display the fallback if there's an error
  if (hasError) {
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
      src={imgSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
    />
  );
};

export default ImageWithFallback;
