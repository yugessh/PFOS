// Performance optimization utilities and React.memo wrappers

import React from 'react';

/**
 * Memo wrapper for components that have stable props
 * This prevents unnecessary re-renders when parent re-renders
 */
export const withMemo = <P extends object>(
  Component: React.ComponentType<P>,
  name?: string
) => {
  const MemoComponent = React.memo(Component, (prevProps, nextProps) => {
    // Return true if props are equal (skip render), false if different (re-render)
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
  });

  if (name) {
    MemoComponent.displayName = `Memo(${name})`;
  }

  return MemoComponent;
};

/**
 * useCallback optimization hook
 * Ensures callbacks are memoized to prevent child component re-renders
 */
export const useCallbackMemo = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  return React.useCallback(callback, deps) as T;
};

/**
 * useMemo optimization hook with better typing
 */
export const useMemoValue = <T,>(
  factory: () => T,
  deps: React.DependencyList
): T => {
  return React.useMemo(factory, deps);
};

/**
 * Measure component render time (development only)
 */
export const measureRenderTime = (componentName: string) => {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return { start: () => {}, end: () => {} };
  }

  return {
    start: () => performance.mark(`${componentName}-start`),
    end: () => {
      performance.mark(`${componentName}-end`);
      performance.measure(componentName, `${componentName}-start`, `${componentName}-end`);
      const measure = performance.getEntriesByName(componentName)[0];
      console.log(`[${componentName}] render time:`, `${measure.duration.toFixed(2)}ms`);
    },
  };
};

/**
 * Lazy load heavy components
 */
export const lazyComponent = <P extends object>(
  importFunc: () => Promise<{ default: React.ComponentType<P> }>,
  fallback: React.ReactNode = null
) => {
  return React.lazy(importFunc);
};

/**
 * Debounce utility
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle utility
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
