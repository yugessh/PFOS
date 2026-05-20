import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        'relative overflow-hidden rounded-md bg-[#151A20] before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-[rgba(126,231,199,0.14)] before:to-transparent before:content-["\\00a0"] before:animate-[skeleton-shimmer_1.4s_infinite]',
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
