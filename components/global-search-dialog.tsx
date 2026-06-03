'use client';

import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ArrowUpRight, Command, Mic, Pin, Search, Sparkles, Star, Trash2, X } from 'lucide-react';
import { useGlobalSearch, type SearchFilter, type SearchResult } from '@/src/hooks/useGlobalSearch';

interface GlobalSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FILTERS: Array<{ id: SearchFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'accounts', label: 'Accounts' },
  { id: 'goals', label: 'Goals' },
  { id: 'investments', label: 'Investments' },
  { id: 'reports', label: 'Reports' },
  { id: 'documents', label: 'Documents' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'assets', label: 'Assets' },
  { id: 'liabilities', label: 'Liabilities' },
];

function formatAmount(result: SearchResult) {
  if (result.amount === undefined) return null;
  return `₹${Math.round(result.amount).toLocaleString()}`;
}

export function GlobalSearchDialog({ open, onOpenChange }: GlobalSearchDialogProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState<SearchFilter>('all');
  const inputRef = useRef<HTMLInputElement>(null);
  const deferredQuery = useDeferredValue(query);
  const { search, commands, recentSearches, savedSearches, popularCommands, addRecentSearch, clearRecentSearches, pinSearch, handleResultSelect, searchAnalytics } = useGlobalSearch();

  const results = useMemo(() => search(deferredQuery, activeFilter), [activeFilter, deferredQuery, search]);
  const flatResults = useMemo(() => results.flatMap((group) => group.results), [results]);

  useEffect(() => {
    if (open) {
      queueMicrotask(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      queueMicrotask(() => {
        setQuery('');
        setSelectedIndex(0);
        setActiveFilter('all');
      });
    }
  }, [open]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onOpenChange(false);
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, Math.max(0, flatResults.length - 1)));
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    }
    if (event.key === 'Enter' && flatResults[selectedIndex]) {
      event.preventDefault();
      handleResultSelect(flatResults[selectedIndex], query);
      onOpenChange(false);
    }
  };

  const showResults = deferredQuery.trim().length > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="top" className="h-[100dvh] overflow-hidden rounded-b-[32px] border-border bg-[#080A0F] px-0 pt-0 text-white sm:h-[88vh]">
        <SheetHeader className="sr-only">
          <SheetTitle>Global Search and Command Palette</SheetTitle>
        </SheetHeader>

        <div className="flex h-full flex-col">
          <div className="border-b border-border bg-[rgba(8,10,15,0.94)] px-4 py-4 backdrop-blur-2xl sm:px-6">
            <div className="mx-auto flex max-w-6xl items-center gap-3 rounded-[28px] border border-border bg-[#151A20] px-4 py-4 shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
              <Search className="h-5 w-5 text-[#7EE7C7]" />
              <Input
                ref={inputRef}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search anything in PFOS or run a command"
                className="h-auto border-none bg-transparent px-0 py-0 text-base text-white shadow-none outline-none placeholder:text-[#64748B] focus-visible:ring-0"
              />
              <div className="hidden items-center gap-2 rounded-full border border-border bg-[#0D141B] px-3 py-1.5 text-[11px] uppercase tracking-[0.26em] text-secondary sm:flex">
                <Command className="h-3.5 w-3.5 text-[#7EE7C7]" />
                Cmd/Ctrl K
              </div>
              <button onClick={() => setQuery('')} className="text-secondary transition hover:text-white" aria-label="Clear search">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mx-auto mt-4 flex max-w-6xl gap-2 overflow-x-auto pb-1">
              {FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(filter.id)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    activeFilter === filter.id
                      ? 'border-[#7EE7C7]/30 bg-[#7EE7C7]/10 text-[#7EE7C7]'
                      : 'border-border bg-[#151A20] text-secondary hover:text-white'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col overflow-hidden px-4 py-4 sm:px-6">
            {showResults ? (
              flatResults.length > 0 ? (
                <div className="flex-1 overflow-y-auto">
                  <AnimatePresence initial={false}>
                    {results.map((group) => (
                      <motion.div
                        key={group.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mb-6"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary">{group.name}</h3>
                          <span className="text-xs text-[#64748B]">{group.results.length} results</span>
                        </div>
                        <div className="space-y-2">
                          {group.results.map((result) => {
                            const flatIndex = flatResults.findIndex((entry) => entry.type === result.type && entry.id === result.id);
                            const selected = flatIndex === selectedIndex;
                            return (
                              <button
                                key={`${result.type}-${result.id}`}
                                type="button"
                                onMouseEnter={() => setSelectedIndex(flatIndex)}
                                onClick={() => {
                                  handleResultSelect(result, query);
                                  onOpenChange(false);
                                }}
                                className={`flex w-full items-start gap-4 rounded-[24px] border p-4 text-left transition ${
                                  selected ? 'border-[#7EE7C7]/30 bg-[#151A20]' : 'border-border bg-[#0D141B] hover:border-[#7EE7C7]/20 hover:bg-[#151A20]'
                                }`}
                              >
                                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[18px] border border-border bg-[#151A20] text-lg text-[#7EE7C7]">
                                  {result.icon || '•'}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-semibold text-white">{result.title}</p>
                                      {result.subtitle ? <p className="mt-1 text-sm text-[#94A3B8]">{result.subtitle}</p> : null}
                                    </div>
                                    <div className="flex items-center gap-3">
                                      {formatAmount(result) ? <span className="text-sm font-medium text-[#7EE7C7]">{formatAmount(result)}</span> : null}
                                      <ArrowUpRight className="h-4 w-4 text-secondary" />
                                    </div>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center rounded-[28px] border border-dashed border-border bg-[#0D141B] p-8 text-center">
                  <Search className="h-8 w-8 text-[#7EE7C7]" />
                  <h3 className="mt-4 text-lg font-semibold">No results found</h3>
                  <p className="mt-2 max-w-md text-sm text-secondary">Try a broader term, switch filters, or run a quick action instead.</p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {commands.slice(0, 4).map((command) => (
                      <button
                        key={command.id}
                        type="button"
                        onClick={() => {
                          handleResultSelect({ type: 'command', id: command.id, title: command.label, subtitle: command.subtitle, href: command.href, icon: command.icon, group: 'Commands', data: command, score: 0 }, query);
                          onOpenChange(false);
                        }}
                        className="rounded-full border border-border bg-[#151A20] px-4 py-2 text-sm text-secondary transition hover:border-[#7EE7C7]/30 hover:text-white"
                      >
                        {command.label}
                      </button>
                    ))}
                  </div>
                </div>
              )
            ) : (
              <div className="grid flex-1 gap-5 overflow-y-auto lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-5">
                  <div className="rounded-[28px] border border-border bg-[#151A20] p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-secondary">Popular Commands</p>
                        <h3 className="mt-1 text-xl font-semibold text-white">Universal Navigation</h3>
                      </div>
                      <Sparkles className="h-5 w-5 text-[#7EE7C7]" />
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {popularCommands.map((command) => (
                        <button
                          key={command.id}
                          type="button"
                          onClick={() => {
                            handleResultSelect({ type: 'command', id: command.id, title: command.label, subtitle: command.subtitle, href: command.href, icon: command.icon, group: 'Commands', data: command, score: 0 });
                            onOpenChange(false);
                          }}
                          className="rounded-[24px] border border-border bg-[#0D141B] p-4 text-left transition hover:border-[#7EE7C7]/20"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xl text-[#7EE7C7]">{command.icon}</span>
                            <ArrowUpRight className="h-4 w-4 text-secondary" />
                          </div>
                          <p className="mt-3 text-sm font-semibold text-white">{command.label}</p>
                          <p className="mt-1 text-sm text-secondary">{command.subtitle}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-border bg-[#151A20] p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-secondary">Recent Searches</p>
                        <h3 className="mt-1 text-xl font-semibold text-white">Continue where you left off</h3>
                      </div>
                      <button onClick={clearRecentSearches} className="inline-flex items-center gap-2 text-sm text-secondary transition hover:text-white">
                        <Trash2 className="h-4 w-4" />
                        Clear
                      </button>
                    </div>
                    <div className="mt-4 space-y-2">
                      {recentSearches.length ? recentSearches.map((item) => (
                        <button key={item} type="button" onClick={() => setQuery(item)} className="flex w-full items-center justify-between rounded-[22px] border border-border bg-[#0D141B] px-4 py-3 text-left text-sm text-white transition hover:border-[#7EE7C7]/20">
                          <span>{item}</span>
                          <Pin className="h-4 w-4 text-secondary" />
                        </button>
                      )) : <div className="rounded-[22px] border border-dashed border-border bg-[#0D141B] p-4 text-sm text-secondary">No recent searches yet. Start typing to build your history.</div>}
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="rounded-[28px] border border-border bg-[#151A20] p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-secondary">Pinned & Saved</p>
                        <h3 className="mt-1 text-xl font-semibold text-white">Favorites and saved queries</h3>
                      </div>
                      <Star className="h-5 w-5 text-[#7EE7C7]" />
                    </div>
                    <div className="mt-4 space-y-2">
                      {savedSearches.length ? savedSearches.map((item) => (
                        <button key={item.id || item.query} type="button" onClick={() => setQuery(item.query)} className="flex w-full items-center justify-between rounded-[22px] border border-border bg-[#0D141B] px-4 py-3 text-left">
                          <div>
                            <p className="text-sm font-medium text-white">{item.label || item.query}</p>
                            <p className="mt-1 text-xs text-secondary">{item.query}</p>
                          </div>
                          <div className="flex items-center gap-2 text-[#7EE7C7]">
                            {item.favorite ? <Star className="h-4 w-4" /> : null}
                            {item.pinned ? <Pin className="h-4 w-4" /> : null}
                          </div>
                        </button>
                      )) : <div className="rounded-[22px] border border-dashed border-border bg-[#0D141B] p-4 text-sm text-secondary">Pin a search from the results list to keep it here.</div>}
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-border bg-[#151A20] p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-secondary">Search Analytics</p>
                        <h3 className="mt-1 text-xl font-semibold text-white">Usage snapshot</h3>
                      </div>
                      <Mic className="h-5 w-5 text-[#7EE7C7]" />
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[22px] border border-border bg-[#0D141B] p-4"><p className="text-xs uppercase tracking-[0.24em] text-secondary">Indexed</p><p className="mt-2 text-2xl font-semibold text-[#7EE7C7]">{searchAnalytics.totalIndexedItems}</p></div>
                      <div className="rounded-[22px] border border-border bg-[#0D141B] p-4"><p className="text-xs uppercase tracking-[0.24em] text-secondary">Saved</p><p className="mt-2 text-2xl font-semibold text-[#7EE7C7]">{searchAnalytics.savedSearchCount}</p></div>
                      <div className="rounded-[22px] border border-border bg-[#0D141B] p-4 sm:col-span-2"><p className="text-xs uppercase tracking-[0.24em] text-secondary">Popular Commands</p><p className="mt-2 text-sm text-white">{searchAnalytics.popularCommands.join(' • ') || 'No command usage recorded yet'}</p></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {showResults && query.trim() ? (
            <div className="border-t border-border bg-[rgba(8,10,15,0.94)] px-4 py-3 sm:px-6">
              <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
                <Button
                  type="button"
                  onClick={() => pinSearch(query)}
                  className="rounded-[20px] bg-[#7EE7C7] px-4 py-2 text-sm font-semibold text-[#071a0d] hover:bg-[#7EE7C7]"
                >
                  <Pin className="mr-2 h-4 w-4" />
                  Save Query
                </Button>
                <button onClick={() => addRecentSearch(query)} className="rounded-[20px] border border-border bg-[#151A20] px-4 py-2 text-sm text-secondary transition hover:text-white">
                  Add to Recent
                </button>
                <span className="text-xs uppercase tracking-[0.24em] text-secondary">Voice-ready architecture active</span>
              </div>
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
