import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ChartCardProps } from './types';

export function ChartCard({
  title,
  description,
  children,
  action,
  footer,
  className,
}: ChartCardProps) {
  return (
    <Card
      className={cn(
        'gap-0 overflow-hidden shadow-sm transition-shadow duration-200 hover:shadow-md',
        'dark:border-border/80',
        className
      )}
    >
      <CardHeader className="border-b border-border/70 pb-4 dark:border-border/50">
        <CardTitle className="text-base font-semibold tracking-tight">{title}</CardTitle>
        {description ? (
          <CardDescription className="text-xs leading-relaxed sm:text-sm">{description}</CardDescription>
        ) : null}
        {action ? <CardAction>{action}</CardAction> : null}
      </CardHeader>
      <CardContent className="pt-6">{children}</CardContent>
      {footer ? (
        <CardFooter className="flex-col items-stretch gap-2 border-t border-border/70 pt-4 dark:border-border/50">
          {footer}
        </CardFooter>
      ) : null}
    </Card>
  );
}
