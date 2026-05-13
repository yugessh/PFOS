"use client";

import React, { useState } from 'react';
import CategoryGrid from '../../components/category/CategoryGrid';
import CategorySelectorSheet from '../../components/category/CategorySelectorSheet';
import AddCategoryModal from '../../components/category/AddCategoryModal';
import { mockCategories, type Category } from '../../lib/categories';

export default function CategoriesPage() {
  const [selected, setSelected] = useState<Category | null>(null);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [categories, setCategories] = useState(mockCategories);

  const handleAdd = (c: Category) => setCategories((s) => [c, ...s]);

  return (
    <div className="min-h-screen bg-zinc-50 p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <div className="flex gap-2">
          <button onClick={() => setSelectorOpen(true)} className="px-3 py-2 rounded-lg bg-white shadow">Select</button>
          <button onClick={() => setAddOpen(true)} className="px-3 py-2 rounded-lg bg-indigo-600 text-white">Add</button>
        </div>
      </header>

      <section className="mt-4">
        <div className="flex gap-3 overflow-x-auto py-2">
          <div className="p-3 bg-white rounded-2xl shadow-sm min-w-[120px]"><div className="text-xs text-zinc-500">Expense</div><div className="font-medium">{categories.filter(c => c.type==='expense').length}</div></div>
          <div className="p-3 bg-white rounded-2xl shadow-sm min-w-[120px]"><div className="text-xs text-zinc-500">Income</div><div className="font-medium">{categories.filter(c => c.type==='income').length}</div></div>
          <div className="p-3 bg-white rounded-2xl shadow-sm min-w-[120px]"><div className="text-xs text-zinc-500">Transfer</div><div className="font-medium">{categories.filter(c => c.type==='transfer').length}</div></div>
        </div>
      </section>

      <main className="mt-6">
        <CategoryGrid categories={categories} onSelect={(c) => setSelected(c)} onEdit={(c) => { setSelected(c); setAddOpen(true); }} />
      </main>

      <CategorySelectorSheet open={selectorOpen} onClose={() => setSelectorOpen(false)} onSelect={(c) => setSelected(c)} />

      <AddCategoryModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={(c) => { handleAdd(c); }} />

      {selected ? (
        <div className="fixed left-4 right-4 bottom-6 p-3 bg-white rounded-2xl shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div style={{ background: selected.color }} className="w-10 h-10 rounded-lg flex items-center justify-center">{selected.icon}</div>
            <div>
              <div className="font-medium">{selected.name}</div>
              <div className="text-xs text-zinc-500">{selected.type}</div>
            </div>
          </div>
          <div>
            <button onClick={() => setSelected(null)} className="text-zinc-500">Close</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
