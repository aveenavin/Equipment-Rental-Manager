import { useState, useCallback, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const STORAGE_PREFIX = 'page-state:';

/**
 * Drop-in replacement for `useState(1)` that persists the current
 * pagination page to `sessionStorage` and restores it on remount.
 *
 * Usage:
 * ```js
 * // Before
 * const [page, setPage] = useState(1);
 *
 * // After
 * const [page, setPage] = useRestoredPage();
 * ```
 *
 * The hook uses the current `location.pathname` as the storage key
 * so no manual configuration is required.
 *
 * The saved page is automatically cleared when the component unmounts
 * due to navigating away to a non-child route (e.g. sidebar navigation),
 * ensuring fresh starts. It is preserved when navigating to a child
 * route (e.g. list → detail page) so the page is restored on return.
 */
const useRestoredPage = () => {
  const { pathname } = useLocation();
  const key = STORAGE_PREFIX + pathname;

  // Read saved page once at mount
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
  const pathnameRef = useRef(pathname);

  // Wrap setPage to also persist to sessionStorage
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

  // On unmount, check if we navigated to a child route (detail page).
  // If not, clear the saved page so the next visit starts fresh.
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const savedPathname = pathname;
    return () => {
      // After unmount, check the new pathname via a microtask so
      // React Router has updated the location
      setTimeout(() => {
        const currentPath = window.location.pathname;
        const isChildRoute = currentPath.startsWith(savedPathname + '/');
        if (!isChildRoute) {
          try {
            sessionStorage.removeItem(STORAGE_PREFIX + savedPathname);
          } catch {
            // sessionStorage unavailable
          }
        }
      }, 0);
    };
  }, [pathname]);

  return [page, setPage];
};

export default useRestoredPage;
