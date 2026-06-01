import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { theme } from "@zesty-io/material";
/* ============================== breakpoints ============================== */

export type BreakpointValues = Record<string, number>;

/** Exclusive offset for `down`/`between`, matching MUI v5. */
const STEP = 0.05;

export type ContainerBreakpoints<K extends string> = {
  keys: readonly K[];
  values: Record<K, number>;
  /** width >= value */
  up: (key: K | number) => string;
  /** width < value (exclusive) */
  down: (key: K | number) => string;
  /** value(start) <= width < value(end) */
  between: (start: K | number, end: K | number) => string;
  /** the span of a single key (up() for the largest key) */
  only: (key: K) => string;
};

function makeBreakpoints<T extends BreakpointValues>(
  values: T
): ContainerBreakpoints<Extract<keyof T, string>> {
  type K = Extract<keyof T, string>;

  const keys = (Object.keys(values) as K[]).sort(
    (a, b) => values[a] - values[b]
  );
  const resolve = (key: K | number) =>
    typeof key === "number" ? key : values[key];

  const up = (key: K | number) => `@container (min-width:${resolve(key)}px)`;
  const down = (key: K | number) =>
    `@container (max-width:${resolve(key) - STEP}px)`;
  const between = (start: K | number, end: K | number) =>
    `@container (min-width:${resolve(start)}px) and (max-width:${
      resolve(end) - STEP
    }px)`;
  const only = (key: K) => {
    const next = keys[keys.indexOf(key) + 1];
    return next ? between(key, next) : up(key);
  };

  return { keys, values: values as Record<K, number>, up, down, between, only };
}

const defaultScale = makeBreakpoints(theme.breakpoints.values);

/* ============================= query parsing ============================= */

type Rect = { width: number; height: number };
type Predicate = (rect: Rect) => boolean;

const queryCache = new Map<string, Predicate>();

const PREFIX = /^@(?:media|container)[^(]*/i;
const FEATURE =
  /^(min-|max-)?(width|height|inline-size|block-size)\s*:\s*([\d.]+)px$/i;
const RANGE =
  /^(width|height|inline-size|block-size)\s*(<=|>=|<|>)\s*([\d.]+)px$/i;
const DUAL =
  /^([\d.]+)px\s*(<=|<)\s*(width|height|inline-size|block-size)\s*(<=|<)\s*([\d.]+)px$/i;

const isHeight = (feature: string) => /height|block/i.test(feature);

function matchCondition(raw: string, { width, height }: Rect): boolean {
  const c = raw.replace(/^\(|\)$/g, "").trim();

  let m = c.match(FEATURE);
  if (m) {
    const dim = isHeight(m[2]) ? height : width;
    const val = parseFloat(m[3]);
    const prefix = m[1]?.toLowerCase();
    return prefix === "min-"
      ? dim >= val
      : prefix === "max-"
      ? dim <= val
      : dim === val;
  }

  m = c.match(RANGE);
  if (m) {
    const dim = isHeight(m[1]) ? height : width;
    const val = parseFloat(m[3]);
    switch (m[2]) {
      case ">=":
        return dim >= val;
      case "<=":
        return dim <= val;
      case ">":
        return dim > val;
      default:
        return dim < val;
    }
  }

  m = c.match(DUAL);
  if (m) {
    const dim = isHeight(m[3]) ? height : width;
    const lo = parseFloat(m[1]);
    const hi = parseFloat(m[5]);
    return (
      (m[2] === "<=" ? dim >= lo : dim > lo) &&
      (m[4] === "<=" ? dim <= hi : dim < hi)
    );
  }

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.warn(`[useContainerQuery] Unsupported condition: "${raw}"`);
  }
  return false;
}

/** Parse a media/container query string into a size predicate (cached). */
export function parseContainerQuery(query: string): Predicate {
  const cached = queryCache.get(query);
  if (cached) return cached;

  const groups = query
    .replace(PREFIX, "")
    .split(",")
    .map((g) =>
      g
        .split(/\s+and\s+/i)
        .map((c) => c.trim())
        .filter(Boolean)
    );

  const predicate: Predicate = (rect) =>
    groups.some((conds) => conds.every((c) => matchCondition(c, rect)));

  queryCache.set(query, predicate);
  return predicate;
}

/* ================================= hook ================================= */

export type UseContainerQueryOptions = {
  /** Returned before the container is first measured. */
  defaultMatches?: boolean;
  /** Override the breakpoint scale used by the `(bp) => string` query form. */
  breakpoints?: BreakpointValues;
};

/**
 * Container-scoped counterpart to MUI's `useMediaQuery`, returning a ref to
 * attach to the observed container. The breakpoint helpers are supplied to
 * the function form directly — no separate factory call needed.
 *
 * @example
 * const [ref, isWide]    = useContainerQuery('(min-width:600px)');
 * const [ref, isDesktop] = useContainerQuery((bp) => bp.up('md'));
 * const [ref, isTablet]  = useContainerQuery((bp) => bp.between('sm', 'lg'), {
 *   defaultMatches: true,
 *   breakpoints: { sm: 480, md: 768, lg: 1024 },
 * });
 */
export function useContainerQuery<T extends Element = HTMLElement>(
  query: string | ((bp: ContainerBreakpoints<string>) => string),
  options?: UseContainerQueryOptions
): readonly [ref: (node: T | null) => void, matches: boolean] {
  const defaultMatches = options?.defaultMatches ?? false;
  const [matches, setMatches] = useState(defaultMatches);

  const custom = options?.breakpoints;
  const bp = useMemo(
    () => (custom ? makeBreakpoints(custom) : defaultScale),
    [custom]
  );

  const queryString = typeof query === "function" ? query(bp) : query;
  const predicate = useMemo(
    () => parseContainerQuery(queryString),
    [queryString]
  );

  const predicateRef = useRef(predicate);
  const rectRef = useRef<Rect | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  const evaluate = useCallback(() => {
    if (!rectRef.current) return;
    const next = predicateRef.current(rectRef.current);
    setMatches((prev) => (prev === next ? prev : next));
  }, []);

  // Pick up a changed query without tearing down the observer.
  useEffect(() => {
    predicateRef.current = predicate;
    evaluate();
  }, [predicate, evaluate]);

  const ref = useCallback(
    (node: T | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;

      if (!node || typeof ResizeObserver === "undefined") return;

      observerRef.current = new ResizeObserver(([entry]) => {
        const box = entry.contentBoxSize?.[0];
        rectRef.current = {
          width: box ? box.inlineSize : entry.contentRect.width,
          height: box ? box.blockSize : entry.contentRect.height,
        };
        evaluate();
      });
      observerRef.current.observe(node);
    },
    [evaluate]
  );

  useEffect(() => () => observerRef.current?.disconnect(), []);

  return [ref, matches] as const;
}
