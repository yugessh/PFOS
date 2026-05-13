"use client";

import React from 'react';
import type { Category } from '../../lib/categories';

interface Props {
  category: Category;
  onSelect?: (c: Category) => void;
  onEdit?: (c: Category) => void;
  selectable?: boolean;
  className?: string;
}

export default function CategoryCard({ category, onSelect, onEdit, selectable = true, className = '' }: Props) {
  return (
    <button
      onClick={() => selectable && onSelect?.(category)}
      className={`flex items-center gap-3 p-3 rounded-2xl shadow-sm bg-white dark:bg-zinc-900 ${className}`}
      aria-label={category.name}
    >
      <div style={{ background: category.color || '#E5E7EB' }}
        className="w-12 h-12 rounded-xl flex items-center justify-center text-lg">
        <span>{category.icon ?? '🏷️'}</span>
      </div>

      <div className="flex-1 text-left">
        <div className="font-medium text-sm">{category.name}</div>
        {category.parentId ? (<div className="text-xs text-zinc-500">Subcategory</div>) : null}
      </div>

      <div className="flex items-center gap-2">
        {onEdit ? (
          <button onClick={(e) => { e.stopPropagation(); onEdit(category); }} className="text-zinc-400 text-sm">Edit</button>
        ) : null}
      </div>
    </button>
  );
}
