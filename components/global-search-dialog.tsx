'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Search,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Trash2,
} from 'lucide-react';
import { useGlobalSearch } from '@/src/hooks/useGlobalSearch';
import { useRouter } from 'next/navigation';

interface GlobalSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearchDialog({
  open,
  onOpenChange,
}: GlobalSearchDialogProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { search, recentSearches, addRecentSearch, clearRecentSearches } =
    useGlobalSearch();

  const results = search(query);
  const flatResults = results.flatMap((g) => g.results);

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onOpenChange(false);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < flatResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatResults[selectedIndex]) {
        handleSelectResult(flatResults[selectedIndex]);
      }
    }
  };

  const handleSelectResult = (result: any) => {
    addRecentSearch(query);

    // Navigate based on result type
    switch (result.type) {
      case 'transaction':
        router.push(`/dashboard/transactions?id=${result.id}`);
        break;
      case 'account':
        router.push(`/dashboard/accounts?id=${result.id}`);
        break;
      case 'goal':
        router.push(`/dashboard/goals?id=${result.id}`);
        break;
      case 'investment':
        router.push(`/dashboard/investments?id=${result.id}`);
        break;
      case 'emi':
        router.push(`/dashboard/emi?id=${result.id}`);
        break;
      case 'policy':
        router.push(`/dashboard/policies?id=${result.id}`);
        break;
      default:
        break;
    }

    onOpenChange(false);
  };

  const handleSearchRecent = (search: string) => {
    setQuery(search);
  };

  const showResults = query.length > 0;
  const showRecent = !showResults && recentSearches.length > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="top" className="rounded-b-3xl max-h-[80vh] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="sr-only">Global Search</SheetTitle>
        </SheetHeader>

        {/* Search Input */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 size-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search transactions, accounts, goals..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-10 py-3 rounded-xl border border-border bg-card"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
              }}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          )}
        </div>

        {/* Search Results */}
        {showResults && flatResults.length > 0 && (
          <div className="space-y-6 pb-4">
            {results.map((group) => (
              <div key={group.name}>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-secondary">
                  {group.name}
                </h3>
                <div className="space-y-2">
                  {group.results.map((result, idx) => {
                    const isSelected =
                      flatResults.indexOf(result) === selectedIndex;
                    return (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => handleSelectResult(result)}
                        onMouseEnter={() =>
                          setSelectedIndex(flatResults.indexOf(result))
                        }
                        className={`w-full flex items-start gap-3 rounded-xl p-3 transition-colors ${
                          isSelected
                            ? 'bg-card-elevated border border-accent-mint'
                            : 'border border-transparent hover:bg-card-elevated'
                        }`}
                      >
                        <div className="mt-1 text-lg">{result.icon}</div>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-foreground">
                            {result.title}
                          </p>
                          {result.subtitle && (
                            <p className="text-xs text-secondary">
                              {result.subtitle}
                            </p>
                          )}
                          {result.date && (
                            <p className="text-xs text-muted-foreground">
                              {new Date(result.date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        {result.amount !== undefined && (
                          <div className="mt-1 text-right">
                            <p
                              className={`font-semibold ${
                                result.type === 'transaction' &&
                                result.data.type === 'expense'
                                  ? 'text-red-500'
                                  : 'text-green-500'
                              }`}
                            >
                              ${result.amount.toFixed(2)}
                            </p>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {showResults && flatResults.length === 0 && (
          <div className="py-12 text-center">
            <Search className="mx-auto mb-3 size-8 text-muted-foreground" />
            <p className="text-sm text-secondary">No results found</p>
            <p className="text-xs text-muted-foreground">
              Try searching for transactions or accounts
            </p>
          </div>
        )}

        {/* Recent Searches */}
        {showRecent && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary">
                Recent searches
              </h3>
              <button
                onClick={clearRecentSearches}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <Trash2 className="size-3" />
                Clear
              </button>
            </div>
            <div className="space-y-2">
              {recentSearches.map((search, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSearchRecent(search)}
                  className="w-full flex items-center gap-2 rounded-lg border border-border p-3 text-left hover:bg-card-elevated transition-colors"
                >
                  <Search className="size-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{search}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!showResults && !showRecent && (
          <div className="py-12 text-center">
            <Search className="mx-auto mb-3 size-8 text-muted-foreground" />
            <p className="text-sm text-secondary">
              Search across all your financial data
            </p>
            <p className="text-xs text-muted-foreground">
              Transactions, accounts, goals, investments, and more
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
