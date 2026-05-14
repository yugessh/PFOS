'use client';

import { usePathname } from 'next/navigation';

export function useActiveRoute() {
  const pathname = usePathname();

  const isActive = (href: string): boolean => {
    // Normalize both paths for comparison
    const normalizedPathname = pathname.replace(/\/$/, '') || '/';
    const normalizedHref = href.replace(/\/$/, '');

    // Exact match
    if (normalizedPathname === normalizedHref) {
      return true;
    }

    // Keep dashboard summary active only on exact route.
    if (normalizedHref === '/dashboard') {
      return normalizedPathname === '/dashboard';
    }

    // Nested route match for app sections.
    if (normalizedPathname.startsWith(`${normalizedHref}/`)) {
      return true;
    }

    return false;
  };

  return { isActive, pathname };
}
