declare module "*.png";
declare module "*.jpg";
declare module "*.svg";
declare module "*.webp";

// `tsconfig.json` sets `allowJs`, so `src/shell/webpack.config.js` is in the program and
// pulls `copy-webpack-plugin`'s types in with it. From v14 those reference `tinyglobby` ->
// `fdir`, whose declarations import `picomatch` — which ships no types and has no bundled
// `@types`. Without this shim `tsc --noEmit` reports a TS7016 inside `node_modules/fdir`.
// Nothing under `src/` imports picomatch; this exists only to keep the typecheck baseline
// clean without adding a `@types/picomatch` devDependency for a build-tooling transitive.
// Delete this line if `@types/picomatch` is ever added — a shorthand ambient declaration
// silently wins over real types, so leaving it would quietly downgrade them back to `any`.
declare module "picomatch";
