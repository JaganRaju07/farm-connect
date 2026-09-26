// src/components/ui/Badge.tsx
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'error' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-surface-muted text-foreground border border-border-default',
  primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-400 border border-primary-200 dark:border-primary-800/50',
  secondary: 'bg-surface text-foreground-secondary border border-border-default',
  success: 'bg-success-100 dark:bg-success-900/30 text-success-800 dark:text-success-400 border border-success-200 dark:border-success-800/50',
  warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50',
  danger: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800/50',
  error: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800/50',
  info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50',
};

export default function Badge({ 
  variant = 'default', 
  children,
  className 
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
