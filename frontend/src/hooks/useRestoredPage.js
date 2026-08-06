import { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const STORAGE_PREFIX = 'page-state:';

/**
 * Drop-in replacement for `useState(1)` that persists the current
 * pagination page to `sessionStorage` and restores it on remount.
 *
 * Usage:
 * ```js
 * const [page, setPage] = useRestoredPage();
 * ```
 *
 * The hook uses the current `location.pathname` as the storage key
 * so no manual configuration is required.
 *
 * Design: No effects, no cleanup, no timers — just reads on mount and
 * writes on every `setPage` call. This makes it immune to React Strict
 * Mode double-mounting and avoids all timing/race conditions.
 */
const useRestoredPage = () => {
  const { pathname } = useLocation();
  const key = STORAGE_PREFIX + pathname;

  const getInitialPage = () => {
    try {
      const saved = sessionStorage.getItem(key);
      if (saved) {
        const parsed = parseInt(saved, 10);
        return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
      }
    } catch {
      // sessionStorage unavailable
    }
    return 1;
  };

  const [page, setPageInternal] = useState(getInitialPage);

  const setPage = useCallback(
    (valueOrUpdater) => {
      setPageInternal((prev) => {
        const next =
          typeof valueOrUpdater === 'function'
            ? valueOrUpdater(prev)
            : valueOrUpdater;
        try {
          sessionStorage.setItem(key, String(next));
        } catch {
          // sessionStorage full or unavailable
        }
        return next;
      });
    },
    [key],
  );

  return [page, setPage];
};

export default useRestoredPage;
