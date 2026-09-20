import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}


const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold transition-all rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

export const buttonVariants = {
  primary: 'bg-primary-700 text-white hover:bg-primary-800 focus:ring-primary-600 shadow-[0_4px_14px_0_rgba(21,128,61,0.39)] hover:shadow-[0_6px_20px_rgba(21,128,61,0.23)] hover:-translate-y-[1px] dark:bg-primary-600 dark:hover:bg-primary-500',
  secondary: 'bg-surface text-foreground border border-border-default hover:bg-surface-muted hover:border-border-default focus:ring-border-default shadow-[0_4px_20px_rgba(0,0,0,0.03)]',
  accent: 'bg-accent-400 text-white hover:bg-accent-500 focus:ring-accent-500 shadow-[0_4px_14px_0_rgba(231,111,81,0.39)] hover:shadow-[0_6px_20px_rgba(231,111,81,0.23)] hover:-translate-y-[1px] dark:bg-accent-500 dark:hover:bg-accent-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:-translate-y-[1px]',
  ghost: 'bg-transparent text-foreground-secondary hover:text-foreground hover:bg-surface-muted',
};

export const buttonSizes = {
  sm: 'text-sm px-3 py-1.5 rounded-lg',
  md: 'text-[15px] px-6 py-2.5',
  lg: 'text-base px-8 py-3',
};

export function getButtonClasses(variant: keyof typeof buttonVariants = 'primary', size: keyof typeof buttonSizes = 'md', fullWidth: boolean = false, className: string = '') {
  return [
    baseStyles,
    buttonVariants[variant],
    buttonSizes[size],
    fullWidth ? 'w-full' : '',
    className,
  ].filter(Boolean).join(' ');
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingText,
      icon,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const classes = getButtonClasses(variant, size, fullWidth, className);

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {loadingText ? loadingText : children}
          </>
        ) : (
          <>
            {icon && icon}
            {children}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
