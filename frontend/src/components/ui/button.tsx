// src/components/ui/Button.tsx
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 
    'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
  secondary: 
    'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-500',
  outline: 
    'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
  ghost: 
    'text-earth-600 hover:bg-earth-100 hover:text-earth-900 focus:ring-earth-500',
  danger: 
    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      className={cn(
        // Base styles
        'inline-flex items-center justify-center font-medium rounded-lg',
        'transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        // Variant styles
        variantStyles[variant],
        // Size styles
        sizeStyles[size],
        // Custom className
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {/* Loading spinner */}
      {isLoading && (
        <Loader2 
          className="mr-2 h-4 w-4 animate-spin" 
          aria-hidden="true" 
        />
      )}
      
      {/* Left icon */}
      {!isLoading && leftIcon && (
        <span className="mr-2" aria-hidden="true">
          {leftIcon}
        </span>
      )}
      
      {/* Button text */}
      {children}
      
      {/* Right icon */}
      {rightIcon && (
        <span className="ml-2" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
}
