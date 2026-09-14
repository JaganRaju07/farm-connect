'use client';

import { cn } from "@/lib/utils";

interface ShinyTextProps {
  text: string;
  className?: string;
  shimmerWidth?: number;
}

export const ShinyText = ({
  text,
  className,
  shimmerWidth = 100,
}: ShinyTextProps) => {
  return (
    <span
      style={
        {
          "--shimmer-width": `${shimmerWidth}px`,
        } as React.CSSProperties
      }
      className={cn(
        "inline-block text-transparent bg-clip-text bg-[linear-gradient(110deg,#1c1917,45%,#b8afa1,55%,#1c1917)] dark:bg-[linear-gradient(110deg,#faf9f7,45%,#b8afa1,55%,#faf9f7)] bg-[length:200%_100%] animate-shimmer",
        className
      )}
    >
      {text}
    </span>
  );
};
