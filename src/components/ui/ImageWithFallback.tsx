
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
  forceRefresh = false,
  lazy = true,
}: ImageWithFallbackProps) => {
  const [isLoading, setIsLoading] = useState(!!src); // Only show loading if there's a src
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 1; // Keep max retries low to speed up fallback display
  
  // Set initial image source with cache busting if needed
  const [imgSrc, setImgSrc] = useState<string | null | undefined>(
    src ? `${src}${src.includes('?') ? '&' : '?'}t=${Date.now()}` : src
  );
  
  // Update the image source when the src prop changes, forceRefresh is triggered, or when retry is needed
  useEffect(() => {
    if (src) {
      // Use a timestamp to avoid browser caching
      const timestamp = Date.now() + retryCount; // Add retryCount to make each retry URL unique
      setImgSrc(`${src}${src.includes('?') ? '&' : '?'}t=${timestamp}`);
      setIsLoading(true);
      setHasError(false);
    } else {
      setImgSrc(null);
      setIsLoading(false);
      setHasError(true); // Immediately show fallback if no src
    }
  }, [src, forceRefresh, retryCount]); // Include retryCount to trigger updates

  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    console.log(`Image error for ${alt}:`, imgSrc);
    setIsLoading(false);
    
    // If we haven't reached max retries, try again with a different timestamp
    if (retryCount < maxRetries && src) {
      console.log(`Retrying image load for ${alt}, attempt ${retryCount + 1}`);
      setRetryCount(prev => prev + 1);
    } else {
      // If max retries reached or no src, show fallback
      console.log(`Max retries reached for ${alt}, showing fallback`);
      setHasError(true);
      if (onError) onError();
    }
  };

  // If there's no source, show fallback immediately without loading state
  if (!imgSrc) {
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
          loading={lazy ? "lazy" : "eager"}
          decoding="async"
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
            <span className="text-gray-400 text-lg font-medium">{alt.charAt(0).toUpperCase()}</span>
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
      loading={lazy ? "lazy" : "eager"}
      decoding="async"
      onError={handleError} // Add onError here to catch runtime errors after successful load
    />
  );
};

export default ImageWithFallback;
