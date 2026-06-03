export const GLOBAL_SEARCH_OPEN_EVENT = 'pfos:open-global-search';

export function openGlobalSearch() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(GLOBAL_SEARCH_OPEN_EVENT));
}
