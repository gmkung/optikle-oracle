
import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ className }) => {
  return (
    <div className={cn("rounded-md bg-muted/50 animate-pulse-soft", className)} />
  );
};

interface LoadingStateProps {
  className?: string;
  type?: "default" | "list" | "detail";
}

const LoadingState: React.FC<LoadingStateProps> = ({ className, type = "default" }) => {
  if (type === "list") {
    return (
      <div className={cn("w-full space-y-4", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 rounded-lg border animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
            <LoadingSkeleton className="h-6 w-2/3 mb-2" />
            <LoadingSkeleton className="h-4 w-3/4 mb-2" />
            <div className="flex justify-between mt-4">
              <LoadingSkeleton className="h-5 w-20" />
              <LoadingSkeleton className="h-5 w-28" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "detail") {
    return (
      <div className={cn("w-full space-y-6 animate-fade-in", className)}>
        <LoadingSkeleton className="h-8 w-3/4 mb-4" />
        <LoadingSkeleton className="h-5 w-full mb-2" />
        <LoadingSkeleton className="h-5 w-5/6 mb-6" />
        
        <div className="space-y-4 mb-6">
          <LoadingSkeleton className="h-6 w-40 mb-2" />
          <div className="grid grid-cols-2 gap-3">
            <LoadingSkeleton className="h-12 w-full" />
            <LoadingSkeleton className="h-12 w-full" />
          </div>
        </div>
        
        <LoadingSkeleton className="h-6 w-40 mb-2" />
        <div className="border rounded-lg p-4">
          <LoadingSkeleton className="h-5 w-3/4 mb-3" />
          <LoadingSkeleton className="h-24 w-full mb-2" />
          <LoadingSkeleton className="h-5 w-1/3 mt-2" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center h-40", className)}>
      <div className="flex flex-col items-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-t-accent border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingState;
