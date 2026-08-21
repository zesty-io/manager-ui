/**
 * The parts of the `CONFIG` / `__CONFIG__` global typing that are *derived* from
 * source modules rather than written out by hand.
 *
 * They live in a `.ts` file, not in `src/globals.d.ts`, on purpose. `tsconfig.json`
 * sets `skipLibCheck: true`, which stops TypeScript checking the inside of every
 * `.d.ts`. An ambient declaration that breaks still fails loudly at its use sites,
 * so that is a safe trade — but a *derived* alias fails silently: the derivation
 * errors only inside the declaration file, the alias degrades to the error type
 * (which behaves as `any`), and every consumer keeps compiling. Under
 * `skipLibCheck` there would be no error at all, and `CONFIG` would quietly become
 * untyped across the whole app.
 *
 * Verified rather than assumed: renaming `production` to anything else in
 * `src/shell/app.config.js` produced `0` errors with these aliases in a `.d.ts` and
 * `skipLibCheck` on, and correctly reported `TS2339` with them here.
 *
 * Keep anything of the form `typeof import(...)`, `ReturnType<...>` or an indexed
 * access into another module in this file. Plain `declare` / `interface` blocks
 * belong in `src/globals.d.ts`.
 */

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
export type AuthoredConfig = EnvConfigModule["production"];

/** Added unconditionally at build time by src/shell/webpack.config.js:24; shape from etc/release.js:27-39. */
export interface BuildInfo {
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

/** The build-time global's shape — see the `__CONFIG__` declaration in src/globals.d.ts. */
export type AuthoredConfigWithBuild = AuthoredConfig & { build: BuildInfo };

/** Merged at runtime — src/shell/index.js:38-41 and src/apps/active-preview/index.js:8-11. */
export type RuntimeConfig = AuthoredConfigWithBuild &
  ReturnType<typeof import("utility/getRuntimeEnv").default> & {
    /** Created only after fetchInstance() resolves — load-instance/index.js:53. */
    URL_PREVIEW_FULL?: string;
  };
