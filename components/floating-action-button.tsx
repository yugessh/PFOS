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
      className="fixed bottom-20 right-4 lg:hidden h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow p-0 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white z-30"
    >
      <Plus className="size-7" />
    </Button>
  );
}
