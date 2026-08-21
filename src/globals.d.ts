/**
 * Ambient declarations for the injected config globals.
 *
 * The *derived* halves of these types live in `src/shell/configTypes.ts`, which is
 * a real `.ts` module and therefore still type-checked under
 * `tsconfig.json`'s `skipLibCheck: true`. Do not move them back here — a broken
 * derivation inside a `.d.ts` is silently suppressed by that flag and takes the
 * whole of `CONFIG`'s typing down with it. See the comment at the top of that file.
 */

/**
 * Build-time global: webpack DefinePlugin substitutes the JSON literal of
 * app.config.js[NODE_ENV] plus `build` (webpack.config.js:218). It is a source
 * substitution, NOT an object on window.
 *
 * The runtime-only keys (URL_MANAGER, DOMAIN, COOKIE_DOMAIN, URL_PREVIEW_FULL)
 * are deliberately absent here so that reading one is a compile error.
 */
declare const __CONFIG__: import("shell/configTypes").AuthoredConfigWithBuild;

declare var CONFIG: import("shell/configTypes").RuntimeConfig;

interface Window {
  CONFIG: import("shell/configTypes").RuntimeConfig;
  zesty?: any;
  zestyStore?: any;
  randomQuote?: { quote: string; quotee: string };
}
