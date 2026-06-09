"use client";

import React, { useState } from 'react';
import type { Category } from '../../lib/categories';
import CategoryCard from './CategoryCard';
import AddCategoryModal from './AddCategoryModal';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (c: Category) => void;
  categories: Category[];
}

export default function CategorySelectorSheet({ open, onClose, onSelect, categories }: Props) {
  const [showAdd, setShowAdd] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end">
      <div className="w-full max-w-md mx-auto bg-white rounded-t-2xl p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Select category</h3>
          <button onClick={onClose} className="text-zinc-500">Close</button>
        </div>

        <div className="mt-3">
          {categories.length === 0 ? (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-center text-sm text-zinc-500">
              No categories found. Add your first category.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {categories.slice(0, 12).map((c) => (
                <CategoryCard key={c.id} category={c} onSelect={(cat) => { onSelect(cat); onClose(); }} selectable />
              ))}
            </div>
          )}

          <div className="mt-4 flex gap-3">
            <button onClick={() => setShowAdd(true)} className="flex-1 py-2 rounded-lg bg-indigo-600 text-white">Quick Add</button>
            <button onClick={onClose} className="flex-1 py-2 rounded-lg bg-zinc-100">Cancel</button>
          </div>
        </div>
      </div>

      <AddCategoryModal open={showAdd} onClose={() => setShowAdd(false)} onAdd={(c) => {
        onSelect(c);
        setShowAdd(false);
        onClose();
      }} />
    </div>
  );
}
