// src/components/ui/Skeleton.tsx
import { cn } from '@/lib/utils';

export default function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-surface-muted border border-border-default', className)}
      {...props}
    />
  );
}
