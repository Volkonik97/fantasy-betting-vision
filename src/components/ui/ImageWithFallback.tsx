
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
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2; // Maximum number of retry attempts
  
  // Always add a timestamp parameter for cache busting to ensure fresh images
  const [imgSrc, setImgSrc] = useState<string | null | undefined>(
    src ? `${src}?t=${Date.now()}` : src
  );
  
  // Update the image source when the src prop changes, forceRefresh is triggered, or when retry is needed
  useEffect(() => {
    if (src) {
      // Always add timestamp to avoid browser caching issues
      const timestamp = Date.now() + retryCount; // Add retryCount to make each retry URL unique
      setImgSrc(`${src}?t=${timestamp}`);
      setIsLoading(true);
      setHasError(false);
    } else {
      setImgSrc(null);
      setIsLoading(false);
    }
  }, [src, forceRefresh, retryCount]); // Include retryCount in dependencies to trigger updates

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    console.log(`Error loading image: ${imgSrc} (retry: ${retryCount}/${maxRetries})`);
    setIsLoading(false);
    
    // If we haven't reached max retries, try again with a different timestamp
    if (retryCount < maxRetries && src) {
      console.log(`Retrying image with new timestamp: ${src}`);
      setRetryCount(prev => prev + 1);
    } else {
      // If max retries reached or no src, show fallback
      setHasError(true);
      onError?.();
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
      onError={handleError} // Add onError here to catch runtime errors after successful load
    />
  );
};

export default ImageWithFallback;
