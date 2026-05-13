"use client";

import React from 'react';
import { Plus } from 'lucide-react';

interface Props {
  onClick?: () => void;
}

export default function FloatingActionButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      aria-label="Add"
      className="fixed bottom-20 right-4 z-50 inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:scale-105 transition-transform sm:bottom-24 sm:right-8"
    >
      <Plus className="w-6 h-6" />
    </button>
  );
}
