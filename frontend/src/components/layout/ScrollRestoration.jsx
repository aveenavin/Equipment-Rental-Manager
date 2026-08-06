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
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  } catch {
    // sessionStorage full or unavailable
  }
};

/**
 * Returns true when navigating "up" the route tree, i.e. the destination
 * is a parent route of the source.
 */
const isNavigatingUp = (fromPath, toPath) => {
  return fromPath !== toPath && fromPath.startsWith(toPath + '/');
};

/**
 * Zero-UI component that saves and restores scroll positions for the
 * `#main-content` scroll container across route changes.
 *
 * Key mechanisms:
 *
 * 1. **Continuous scroll tracking** — Positions are saved via a scroll
 *    event listener as the user scrolls.
 *
 * 2. **Snapshot backup** — A `useLayoutEffect` takes a frozen copy of
 *    all saved positions the instant the route changes (synchronous,
 *    before the browser fires any clamping scroll events). This snapshot
 *    is the authoritative source for restoration — it cannot be
 *    corrupted by DOM-swap clamping events regardless of browser/device
 *    event ordering.
 *
 * 3. **Navigation guard** — A ref flag blocks the scroll handler from
 *    recording during route transitions.
 *
 * 4. **Dual back-navigation detection** — Uses both `popstate` (browser
 *    back/forward) and route-hierarchy analysis (in-app `<Link>` to a
 *    parent route).
 */
const ScrollRestoration = () => {
  const { pathname } = useLocation();
  const prevPathRef = useRef(pathname);
  const isPopRef = useRef(false);
  const positionsRef = useRef(readPositions());
  const snapshotRef = useRef({});
  const debounceRef = useRef(null);
  const isNavigatingRef = useRef(false);

  // ── Detect browser back / forward ──────────────────────────────────
  useEffect(() => {
    const handler = () => { isPopRef.current = true; };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  // ── Snapshot + navigation guard ────────────────────────────────────
  // useLayoutEffect runs synchronously after DOM commit but BEFORE the
  // browser fires scroll events from content-swap clamping.
  //
  // We freeze a copy of all scroll positions here so that even if the
  // scroll handler or ref gets corrupted by a clamping event on some
  // browsers, we have a clean copy to restore from.
  useLayoutEffect(() => {
    if (prevPathRef.current !== pathname) {
      snapshotRef.current = { ...positionsRef.current };
      isNavigatingRef.current = true;
    }
  }, [pathname]);

  // ── Continuously save scroll position while user scrolls ───────────
  useEffect(() => {
    const container = document.getElementById('main-content');
    const scrollTarget = container || window;

    const handleScroll = () => {
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
      // Flush — use snapshot if available (immune to clamping corruption)
      const merged = { ...positionsRef.current, ...snapshotRef.current };
      writePositions(merged);
    };
  }, [pathname]);

  // ── Restore or scroll-to-top on route change ──────────────────────
  useEffect(() => {
    const prevPath = prevPathRef.current;
    if (prevPath === pathname) return;

    const wasPop = isPopRef.current;
    isPopRef.current = false;

    const shouldRestore = wasPop || isNavigatingUp(prevPath, pathname);

    // Read from snapshot (guaranteed clean) with ref fallback
    const target = shouldRestore
      ? (snapshotRef.current[pathname] ?? positionsRef.current[pathname] ?? 0)
      : 0;

    const el = document.getElementById('main-content');
    let settled = false;
    let observer = null;
    let safetyTimeout = null;
    let debounceTimeout = null;

    // Forward navigation or target is 0 — scroll to top immediately
    if (target === 0) {
      requestAnimationFrame(() => {
        if (el) {
          el.scrollTop = 0;
        } else {
          window.scrollTo(0, 0);
        }
        isNavigatingRef.current = false;
      });

      prevPathRef.current = pathname;

      return () => { isNavigatingRef.current = false; };
    }

    // ── Content-aware restoration for back navigation ──────────────
    // Instead of blind timer retries (which overshoot on mobile when
    // content hasn't loaded yet), we use a MutationObserver to watch
    // for DOM changes and only restore when the container is actually
    // tall enough to accommodate the target scroll position.

    const tryRestore = () => {
      if (settled || !el) return;

      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        if (settled) return;

        const maxScroll = el.scrollHeight - el.clientHeight;

        // Only set scrollTop when content is tall enough — this
        // prevents the "shows footer" overshoot on mobile
        if (maxScroll >= target) {
          el.scrollTop = target;
          settled = true;
          isNavigatingRef.current = false;
          if (observer) observer.disconnect();
          clearTimeout(safetyTimeout);
        }
      }, 50);
    };

    // First attempt after paint
    requestAnimationFrame(tryRestore);

    // Watch for DOM changes (async data loading, skeleton → real content)
    if (el) {
      observer = new MutationObserver(tryRestore);
      observer.observe(el, { childList: true, subtree: true });
    }

    // Safety: stop watching after 3s and do a best-effort restore
    safetyTimeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        isNavigatingRef.current = false;
        if (observer) observer.disconnect();
        // Final best-effort — clamp to max available scroll
        if (el) {
          const maxScroll = el.scrollHeight - el.clientHeight;
          if (maxScroll > 0) {
            el.scrollTop = Math.min(target, maxScroll);
          }
        }
      }
    }, 3000);

    prevPathRef.current = pathname;

    return () => {
      settled = true;
      isNavigatingRef.current = false;
      clearTimeout(debounceTimeout);
      clearTimeout(safetyTimeout);
      if (observer) observer.disconnect();
    };
  }, [pathname]);

  return null;
};

export default ScrollRestoration;
