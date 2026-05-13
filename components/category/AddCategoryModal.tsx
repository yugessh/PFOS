"use client";

import React, { useState } from 'react';
import type { Category, CategoryType } from '../../lib/categories';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (c: Category) => void;
  defaultType?: CategoryType;
}

export default function AddCategoryModal({ open, onClose, onAdd, defaultType = 'expense' }: Props) {
  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>(defaultType);
  const [color, setColor] = useState('#FF7043');
  const [icon, setIcon] = useState('🏷️');

  if (!open) return null;

  const handleAdd = () => {
    const id = `${type[0]}_${name.toLowerCase().replace(/\s+/g, '_')}`;
    const cat: Category = { id, name: name || 'New Category', type, color, icon };
    onAdd(cat);
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end">
      <div className="w-full max-w-md mx-auto bg-white rounded-t-2xl p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Add category</h3>
          <button onClick={onClose} className="text-zinc-500">Close</button>
        </div>

        <div className="mt-4">
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full p-3 rounded-lg bg-zinc-100 mb-3" />

          <div className="flex gap-2 mb-3">
            <select value={type} onChange={(e) => setType(e.target.value as CategoryType)}
              className="p-2 rounded-lg bg-zinc-100 flex-1">
              <option value="expense">Expense</option>
              <option value="income">Income</option>
              <option value="transfer">Transfer</option>
            </select>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-12 h-12 p-0 border-0" />
          </div>

          <div className="flex gap-2 items-center">
            <input value={icon} onChange={(e) => setIcon(e.target.value)} className="p-2 rounded-lg bg-zinc-100 flex-1" />
            <button onClick={handleAdd} className="px-4 py-2 rounded-lg bg-indigo-600 text-white">Add</button>
          </div>
        </div>
      </div>
    </div>
  );
}
