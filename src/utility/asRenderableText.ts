/**
 * Content field values are `unknown` (see `shell/services/types.ts` `Data`) — a field can
 * hold an array or object (repeater, images). Returns `undefined` for anything that is not
 * renderable, so `||` fallback chains still reach their next branch. Do not substitute
 * `String(value)`: `String(undefined)` is the truthy `"undefined"` and would render
 * literally instead of falling through.
 */
export const asRenderableText = (value: unknown): string | number | undefined =>
  typeof value === "string" || typeof value === "number" ? value : undefined;
