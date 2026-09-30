/**
 * Third-party brand colours.
 *
 * These are other companies' identities, not Zesty design decisions, so they
 * are deliberately NOT design system tokens: a palette change must leave them
 * exactly where they are. Keeping them in one module makes that rule
 * enforceable by import path rather than by memorising hex values.
 *
 * A brand hex outside this file is a bug. A Zesty hex inside it is also a bug.
 *
 * See docs/design-system.md section 3.
 */
export const BRAND_COLORS = {
  twitter: "#1DA0F0",
  instagram: "#6727BB",
  facebook: "#1574EA",
  youtube: "#FE0000",
  google: "#131CA4",
} as const;
