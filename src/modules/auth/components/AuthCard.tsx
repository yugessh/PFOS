import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface AuthCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

export function AuthCard({ children, className, title, description }: AuthCardProps) {
  return (
    <div className={cn(
      'w-full max-w-md mx-auto',
      className
    )}>
      <div className="rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,rgba(21,26,32,0.92),rgba(14,17,23,0.88))] p-8 shadow-[0_24px_70px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        {(title || description) && (
          <div className="mb-8 text-center">
            {title && (
              <h1 className="text-2xl font-bold text-white mb-2">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-secondary text-sm">
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
