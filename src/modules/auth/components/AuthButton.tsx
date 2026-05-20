import { cn } from '@/lib/utils';
import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  children: ReactNode;
}

export const AuthButton = forwardRef<HTMLButtonElement, AuthButtonProps>(
  ({ className, variant = 'primary', loading = false, children, disabled, ...props }, ref) => {
    const baseStyles = 'w-full py-3 px-4 rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const variants = {
      primary: 'button-primary',
      secondary: 'bg-card-elevated text-white focus:ring-[rgba(126,231,199,0.3)] disabled:bg-card-elevated',
      outline: 'button-ghost text-white hover:bg-card-elevated focus:ring-[rgba(126,231,199,0.3)] disabled:bg-card-elevated'
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          (loading || disabled) && 'cursor-not-allowed opacity-70',
          className
        )}
        disabled={loading || disabled}
        {...props}
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-[#071a0d] border-t-transparent rounded-full animate-spin" />
            <span>Loading...</span>
          </div>
        ) : (
          children
        )}
      </button>
    );
  }
);

AuthButton.displayName = 'AuthButton';
