'use client';

import React, { useState } from 'react';
import CategoryGrid from '../../components/category/CategoryGrid';
import CategorySelectorSheet from '../../components/category/CategorySelectorSheet';
import AddCategoryModal from '../../components/category/AddCategoryModal';
import { type Category } from '../../lib/categories';
import { useCategories } from '@/src/hooks/useCategories';

export default function CategoriesPage() {
  const { categories, loading, error, addCategory, saving } = useCategories();
  const [selected, setSelected] = useState<Category | null>(null);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="min-h-screen bg-main px-4 py-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 rounded-[32px] border border-border bg-card p-6 shadow-[0_24px_60px_rgba(0,0,0,0.32)] lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-secondary">Expense intelligence</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">Categories</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setSelectorOpen(true)} className="rounded-[22px] border border-border bg-card px-4 py-3 text-sm font-semibold text-secondary transition hover:bg-card-elevated">
              Select
            </button>
            <button onClick={() => setAddOpen(true)} className="rounded-[22px] bg-accent-mint px-4 py-3 text-sm font-semibold text-[#071a0d] shadow-[0_16px_36px_rgba(126,231,199,0.24)] transition hover:brightness-95">
              Add
            </button>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          {['expense', 'income', 'transfer'].map((type) => (
            <div key={type} className="rounded-[28px] border border-border bg-card p-5 shadow-[0_18px_45px_rgba(0,0,0,0.27)]">
              <p className="text-xs uppercase tracking-[0.32em] text-secondary">{type === 'expense' ? 'Expense' : type === 'income' ? 'Income' : 'Transfer'}</p>
              <p className="mt-3 text-3xl font-semibold text-foreground">{categories.filter((c) => c.type === type).length}</p>
            </div>
          ))}
        </section>

        <main className="grid gap-5">
          {error ? (
            <div className="rounded-[24px] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="rounded-[28px] border border-border bg-card p-5 text-sm text-secondary">Loading categories...</div>
          ) : null}

          <CategoryGrid categories={categories} onSelect={(c) => setSelected(c)} onEdit={(c) => { setSelected(c); setAddOpen(true); }} />
        </main>
      </div>

      <CategorySelectorSheet
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        onSelect={(c) => setSelected(c)}
        categories={categories}
      />
      <AddCategoryModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={(c) => {
          void addCategory({
            name: c.name,
            type: c.type,
            color: c.color,
            icon: c.icon,
            parentId: c.parentId,
          });
        }}
      />

      {saving ? (
        <div className="fixed bottom-6 right-6 rounded-2xl border border-border bg-card px-3 py-2 text-xs text-secondary shadow-[0_18px_45px_rgba(0,0,0,0.25)]">
          Saving category...
        </div>
      ) : null}

      {selected ? (
        <div className="fixed left-4 right-4 bottom-6 z-40 rounded-[28px] border border-border bg-card p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-3xl" style={{ background: selected.color }}>
                <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-[#071a0d]">{selected.icon}</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-foreground">{selected.name}</div>
                <div className="text-sm text-secondary">{selected.type}</div>
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="rounded-[20px] border border-border bg-card px-4 py-3 text-sm font-medium text-secondary transition hover:bg-card-elevated">
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
