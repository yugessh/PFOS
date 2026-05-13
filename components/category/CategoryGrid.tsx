"use client";

import React, { useMemo, useState } from 'react';
import type { Category, CategoryType } from '../../lib/categories';
import CategoryCard from './CategoryCard';

interface Props {
  categories: Category[];
  onSelect?: (c: Category) => void;
  onEdit?: (c: Category) => void;
  initialType?: CategoryType;
}

export default function CategoryGrid({ categories, onSelect, onEdit, initialType = 'expense' }: Props) {
  const [type, setType] = useState<CategoryType>(initialType);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return categories.filter((c) => c.type === type && (!q || c.name.toLowerCase().includes(q)));
  }, [categories, type, query]);

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="flex items-center gap-3 mt-4">
        <div className="flex rounded-full bg-zinc-100 p-1">
          {(['expense','income','transfer'] as CategoryType[]).map((t) => (
            <button key={t} onClick={() => setType(t)}
              className={`px-3 py-1 rounded-full text-sm ${t===type ? 'bg-white shadow' : 'text-zinc-600'}`}>
              {t === 'expense' ? 'Expense' : t === 'income' ? 'Income' : 'Transfer'}
            </button>
          ))}
        </div>

        <div className="flex-1">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search categories"
            className="w-full p-2 rounded-lg bg-zinc-100 text-sm" />
        </div>

        <div>
          <button className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm">Add</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        {filtered.map((c) => (
          <CategoryCard key={c.id} category={c} onSelect={onSelect} onEdit={onEdit} />
        ))}
      </div>
    </div>
  );
}
