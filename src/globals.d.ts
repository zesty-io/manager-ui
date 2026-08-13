/**
 * Derived from src/shell/app.config.js — adding a key to its `production` block
 * makes it available here with no edit to this file. See #1358.
 *
 * `production` is the canonical schema because it is the superset of all four
 * env blocks (34 keys; stage 33, development 33, local 28). The consequence,
 * deliberately accepted: keys that some blocks omit are typed as present
 * regardless of the build env — API_METRICS, INSTANCE_SCREENSHOTS_BUCKET,
 * URL_APPS, URL_MARKETPLACE and SERVICE_MEDIA_MODIFY are absent from `local`,
 * GOOGLE_WEB_FONTS_KEY from `local` and `development`, and the lowercase
 * `service` object from `stage`, so reading one of those in such a build yields
 * undefined with no compile error. Restoring env parity in app.config.js is
 * tracked separately.
 */
type EnvConfigModule = typeof import("shell/app.config");
type AuthoredConfig = EnvConfigModule["production"];

/** Added unconditionally at build time by src/shell/webpack.config.js:24; shape from etc/release.js:27-39. */
interface BuildInfo {
  _meta: Record<string, unknown>;
  data: {
    version: string;
    environment: string;
    gitCommit: string;
    gitBranch: string;
    buildEngineer: string;
    gitState: string;
    buildTimeStamp: number;
  };
  message: string;
}

/**
 * Build-time global: webpack DefinePlugin substitutes the JSON literal of
 * app.config.js[NODE_ENV] plus `build` (webpack.config.js:218). It is a source
 * substitution, NOT an object on window.
 *
 * The runtime-only keys (URL_MANAGER, DOMAIN, COOKIE_DOMAIN, URL_PREVIEW_FULL)
 * are deliberately absent here so that reading one is a compile error.
 */
declare const __CONFIG__: AuthoredConfig & { build: BuildInfo };

/** Merged at runtime — src/shell/index.js:38-41 and src/apps/active-preview/index.js:8-11. */
type RuntimeConfig = AuthoredConfig & { build: BuildInfo } & ReturnType<
    typeof import("utility/getRuntimeEnv").default
  > & {
    /** Created only after fetchInstance() resolves — load-instance/index.js:53. */
    URL_PREVIEW_FULL?: string;
  };

declare var CONFIG: RuntimeConfig;

interface Window {
  CONFIG: RuntimeConfig;
  zesty?: any;
  zestyStore?: any;
  randomQuote?: { quote: string; quotee: string };
}
