'use client';

import { cn } from "@/lib/utils";

interface GradientDividerProps {
  className?: string;
  intensity?: "light" | "medium" | "strong";
  direction?: "horizontal" | "vertical";
}

export function GradientDivider({ 
  className, 
  intensity = "medium",
  direction = "horizontal" 
}: GradientDividerProps) {
  
  const intensityMap = {
    light: "from-earth-200/20 via-earth-300 to-earth-200/20",
    medium: "from-earth-100 via-earth-300 to-earth-100",
    strong: "from-primary-100 via-primary-300 to-primary-100"
  };

  const isHorizontal = direction === "horizontal";

  return (
    <div 
      className={cn(
        "flex shrink-0 items-center justify-center",
        isHorizontal ? "w-full py-4" : "h-full px-4",
        className
      )}
    >
      <div 
        className={cn(
          "bg-gradient-to-r rounded-full",
          isHorizontal ? "w-full h-px" : "w-px h-full bg-gradient-to-b",
          intensityMap[intensity]
        )} 
      />
    </div>
  );
}
