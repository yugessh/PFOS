'use client';

import { usePathname } from 'next/navigation';

export function useActiveRoute() {
  const pathname = usePathname();

  const isActive = (href: string): boolean => {
    // Normalize both paths for comparison
    const normalizedPathname = pathname.replace(/\/$/, '');
    const normalizedHref = href.replace(/\/$/, '');

    // Exact match
    if (normalizedPathname === normalizedHref) {
      return true;
    }

    // Handle /dashboard as active when on /dashboard
    if (normalizedHref === '/dashboard' && normalizedPathname === '/dashboard') {
      return true;
    }

    return false;
  };

  return { isActive, pathname };
}
