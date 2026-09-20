// src/components/ui/Input.tsx
import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className,
      id,
      ...props
    },
    ref
  ) => {
    // Generate a unique ID if not provided
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
            <label
              htmlFor={inputId}
              className="block text-sm font-medium text-foreground-secondary mb-1"
            >
              {label}
            </label>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-foreground-muted">
              {leftIcon}
            </div>
          )}

          {/* Input field */}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full px-4 py-2 border rounded-lg bg-surface',
              'text-foreground placeholder:text-foreground-muted',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-0 dark:focus:ring-offset-surface',
              // Default state
              'border-border-default focus:border-primary-500 focus:ring-primary-500',
              // Error state
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              // Disabled state
              'disabled:bg-surface-muted disabled:cursor-not-allowed disabled:text-foreground-muted',
              // Icon padding
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              [errorId, helperId].filter(Boolean).join(' ') || undefined
            }
            {...props}
          />

          {/* Right icon */}
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-foreground-muted">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {/* Helper text */}
        {helperText && !error && (
          <p id={helperId} className="mt-1 text-sm text-foreground-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
