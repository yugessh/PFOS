'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingActionButtonProps {
  onClick?: () => void;
  className?: string;
}

export function FloatingActionButton({
  onClick,
  className,
}: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={"fixed bottom-28 right-4 lg:hidden h-16 w-16 rounded-full bg-accent-mint text-[#071a0d] shadow-[0_18px_40px_rgba(126,231,199,0.22)] hover:shadow-[0_22px_48px_rgba(126,231,199,0.32)] transition-all p-0 flex items-center justify-center z-40 " + (className ?? '')}
    >
      <Plus size={26} />
    </Button>
  );
}
