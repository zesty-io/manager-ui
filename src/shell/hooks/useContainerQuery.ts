import { useState, useLayoutEffect, useMemo, useCallback } from "react";

function parseBreakpointQuery(query: string) {
  const match = query.match(/(max-width|min-width):\s*([0-9.]+)px/i);
  if (!match) return null;
  return {
    isMax: match[1].toLowerCase() === "max-width",
    value: parseFloat(match[2]),
  };
}

/**
 * Like useMediaQuery but measures a container element instead of the viewport.
 *
 * Returns { ref, matches }. Attach ref to the element you want to observe —
 * the hook owns the ref and ResizeObserver internally.
 *
 * Accepts query strings from theme.breakpoints or theme.containerQueries.
 *
 * @example
 * const { ref, matches: isSmall } = useContainerQuery(theme.breakpoints.down("sm"));
 * return <div ref={ref}>...</div>;
 */
export const useContainerQuery = (
  query: string
): { ref: (el: Element | null) => void; matches: boolean } => {
  const [element, setElement] = useState<Element | null>(null);
  const [matches, setMatches] = useState(false);
  const parsed = useMemo(() => parseBreakpointQuery(query), [query]);

  const ref = useCallback((el: Element | null) => {
    setElement(el);
  }, []);

  useLayoutEffect(() => {
    if (!parsed || !element) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      setMatches(parsed.isMax ? width <= parsed.value : width >= parsed.value);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [element, parsed]);

  return { ref, matches };
};
