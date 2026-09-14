'use client';

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Leaf } from "lucide-react";
import Link from "next/link";

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
    <div className={cn("flex flex-col items-center justify-center p-12 md:p-16 text-center card bg-white border border-earth-200 shadow-[0_8px_30px_rgba(0,0,0,0.04)]", className)}>
      <div className="w-24 h-24 bg-earth-50 rounded-[2rem] flex items-center justify-center mb-6 border border-earth-100 shadow-inner">
        {icon ? icon : <Leaf className="w-10 h-10 text-earth-400" />}
      </div>
      
      <h3 className="text-2xl font-bold font-display text-earth-900 tracking-tight mb-3">
        {title}
      </h3>
      
      <p className="text-earth-500 text-base md:text-lg max-w-sm mb-8 leading-relaxed">
        {description}
      </p>
      
      {(actionText && actionHref) && (
        <Link href={actionHref} className="btn-primary px-8 h-12 text-base font-semibold">
          {actionText}
        </Link>
      )}
      
      {(actionText && onAction && !actionHref) && (
        <button onClick={onAction} className="btn-primary px-8 h-12 text-base font-semibold">
          {actionText}
        </button>
      )}
    </div>
  );
}
