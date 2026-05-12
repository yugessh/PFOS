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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
        {(title || description) && (
          <div className="mb-8 text-center">
            {title && (
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm">
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
