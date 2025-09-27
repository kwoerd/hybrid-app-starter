import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center font-semibold text-sm uppercase tracking-wide transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
      primary: "bg-brand-pink text-text-primary border border-brand-pink hover:bg-brand-pink-hover hover:border-brand-pink-hover focus:ring-brand-pink",
      secondary: "bg-transparent text-text-primary border border-border-primary hover:bg-bg-secondary hover:border-border-secondary focus:ring-border-primary",
      ghost: "bg-transparent text-text-secondary border-none hover:bg-bg-secondary hover:text-text-primary focus:ring-border-primary",
      success: "bg-success text-text-primary border border-success hover:bg-success-hover hover:border-success-hover focus:ring-success",
      warning: "bg-warning text-text-primary border border-warning hover:bg-warning-hover hover:border-warning-hover focus:ring-warning",
      error: "bg-error text-text-primary border border-error hover:bg-error-hover hover:border-error-hover focus:ring-error",
      info: "bg-info text-text-primary border border-info hover:bg-info-hover hover:border-info-hover focus:ring-info",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs h-8",
      md: "px-4 py-2 text-sm h-9",
      lg: "px-6 py-3 text-base h-12",
    };

    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          "rounded-button",
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Loading...</span>
          </div>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
