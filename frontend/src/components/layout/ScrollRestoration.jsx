import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const STORAGE_KEY = 'scroll-positions';

const readPositions = () => {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
};

const writePositions = (positions) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
};

/**
 * Returns true when navigating "up" the route tree, i.e. the destination
 * is a parent route of the source.
 *
 * Examples:
 *   /catalog/abc123       → /catalog          = true
 *   /my-rentals/abc       → /my-rentals       = true
 *   /admin/equipment/x    → /admin/equipment  = true
 *   /admin/equipment      → /admin/customers  = false  (sibling)
 *   /catalog              → /catalog/abc123   = false  (child)
 */
const isNavigatingUp = (fromPath, toPath) => {
  return fromPath !== toPath && fromPath.startsWith(toPath + '/');
};

/**
 * Zero-UI component that saves and restores scroll positions for the
 * `#main-content` scroll container across route changes.
 *
 * Three key mechanisms make this work:
 *
 * 1. **Continuous scroll tracking** — Positions are saved via a scroll
 *    event listener as the user scrolls, NOT at navigation time. By the
 *    time a useEffect fires for a route change, React has already
 *    committed the new DOM and the container's scrollTop has been reset.
 *
 * 2. **useLayoutEffect navigation guard** — When React swaps the Outlet
 *    content, the browser clamps scrollTop to 0 and fires a scroll event.
 *    A useLayoutEffect sets a guard flag synchronously after DOM commit
 *    but BEFORE the browser fires the clamping scroll event, preventing
 *    the scroll handler from overwriting saved positions with 0.
 *
 * 3. **Dual back-navigation detection** — "Back" navigation is detected
 *    via BOTH popstate (browser back/forward) AND route-hierarchy
 *    analysis (in-app <Link> to a parent route). The app uses
 *    <Link to="/my-rentals"> for back navigation, which is a history
 *    push — popstate never fires for pushes.
 */
const ScrollRestoration = () => {
  const { pathname } = useLocation();
  const prevPathRef = useRef(pathname);
  const isPopRef = useRef(false);
  const positionsRef = useRef(readPositions());
  const debounceRef = useRef(null);
  const isNavigatingRef = useRef(false);

  // ── Detect browser back / forward ──────────────────────────────────
  useEffect(() => {
    const handler = () => { isPopRef.current = true; };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  // ── Navigation guard ───────────────────────────────────────────────
  // useLayoutEffect runs synchronously after DOM commit but BEFORE the
  // browser fires scroll events caused by content-swap clamping. This
  // prevents the scroll handler from overwriting saved positions with
  // the clamped-to-zero value.
  useLayoutEffect(() => {
    if (prevPathRef.current !== pathname) {
      isNavigatingRef.current = true;
    }
  }, [pathname]);

  // ── Continuously save scroll position while user scrolls ───────────
  // The ref is updated synchronously (cheap); sessionStorage writes
  // are debounced for performance.
  useEffect(() => {
    const container = document.getElementById('main-content');
    const scrollTarget = container || window;

    const handleScroll = () => {
      // Skip saves triggered by content-swap clamping during navigation
      if (isNavigatingRef.current) return;

      const scrollTop = container ? container.scrollTop : window.scrollY;
      positionsRef.current[pathname] = scrollTop;

      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        writePositions(positionsRef.current);
      }, 150);
    };

    scrollTarget.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      scrollTarget.removeEventListener('scroll', handleScroll);
      clearTimeout(debounceRef.current);
      writePositions(positionsRef.current);
    };
  }, [pathname]);

  // ── Restore or scroll-to-top on route change ──────────────────────
  useEffect(() => {
    const prevPath = prevPathRef.current;
    if (prevPath === pathname) return;

    const wasPop = isPopRef.current;
    isPopRef.current = false;

    const shouldRestore = wasPop || isNavigatingUp(prevPath, pathname);
    const target = shouldRestore ? (positionsRef.current[pathname] ?? 0) : 0;

    const applyScroll = () => {
      const el = document.getElementById('main-content');
      if (el) {
        el.scrollTop = target;
      } else {
        window.scrollTo(0, target);
      }
    };

    // Apply after paint, then clear the navigation guard so future
    // user scrolls are tracked again
    const rafId = requestAnimationFrame(() => {
      applyScroll();
      isNavigatingRef.current = false;
    });

    // Retry for pages with async content — the container may not be
    // tall enough on the first frame to reach the saved position
    let t1, t2;
    if (shouldRestore && target > 0) {
      t1 = setTimeout(applyScroll, 200);
      t2 = setTimeout(applyScroll, 500);
    }

    prevPathRef.current = pathname;

    return () => {
      cancelAnimationFrame(rafId);
      if (t1) clearTimeout(t1);
      if (t2) clearTimeout(t2);
      isNavigatingRef.current = false;
    };
  }, [pathname]);

  return null;
};

export default ScrollRestoration;
