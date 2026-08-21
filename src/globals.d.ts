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
