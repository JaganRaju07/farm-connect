'use client';

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Leaf } from "lucide-react";
import Link from "next/link";
import Button from "@/components/common/button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionText,
  actionHref,
  onAction,
  className
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 md:p-16 text-center card bg-surface border-border-default", className)}>
      <div className="w-24 h-24 bg-surface-muted rounded-[2rem] flex items-center justify-center mb-6 border border-border-subtle shadow-inner">
        {icon ? icon : <Leaf className="w-10 h-10 text-foreground-muted" />}
      </div>
      
      <h3 className="text-2xl font-bold font-display text-foreground tracking-tight mb-3">
        {title}
      </h3>
      
      <p className="text-foreground-secondary text-base md:text-lg max-w-sm mb-8 leading-relaxed">
        {description}
      </p>
      
      {(actionText && actionHref) && (
        <Link href={actionHref}>
          <Button variant="primary" className="px-8 h-12 text-base">
            {actionText}
          </Button>
        </Link>
      )}
      
      {(actionText && onAction && !actionHref) && (
        <Button onClick={onAction} variant="primary" className="px-8 h-12 text-base">
          {actionText}
        </Button>
      )}
    </div>
  );
}
