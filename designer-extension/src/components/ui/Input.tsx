import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'success' | 'warning' | 'error';
  label?: string;
  helperText?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = 'default', label, helperText, error, type = 'text', ...props }, ref) => {
    const baseClasses = "flex h-9 w-full rounded-input border border-border-primary bg-bg-primary px-3 py-1 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200";
    
    const variants = {
      default: "focus:border-brand-pink focus:ring-brand-pink",
      success: "border-success focus:border-success focus:ring-success",
      warning: "border-warning focus:border-warning focus:ring-warning",
      error: "border-error focus:border-error focus:ring-error",
    };

    const inputElement = (
      <input
        type={type}
        className={cn(
          baseClasses,
          variants[variant],
          error && "border-error focus:border-error focus:ring-error",
          className
        )}
        ref={ref}
        {...props}
      />
    );

    if (label || helperText || error) {
      return (
        <div className="space-y-1">
          {label && (
            <label className="text-sm font-medium text-text-primary">
              {label}
            </label>
          )}
          {inputElement}
          {error && (
            <p className="text-xs text-error">
              {error}
            </p>
          )}
          {helperText && !error && (
            <p className="text-xs text-text-muted">
              {helperText}
            </p>
          )}
        </div>
      );
    }

    return inputElement;
  }
);

Input.displayName = "Input";

export { Input };
