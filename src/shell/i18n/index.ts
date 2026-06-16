import i18n from "i18next";
import ChainedBackend from "i18next-chained-backend";
import LocalStorageBackend from "i18next-localstorage-backend";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import { Sentry } from "../../utility/sentry";

declare const __GIT_HASH__: string;
// Injected by webpack DefinePlugin (see src/shell/webpack.config.js). ENV is
// one of "production" | "stage" | "development" | "local".
declare const __CONFIG__: { ENV?: string } | undefined;

const gitHash = typeof __GIT_HASH__ !== "undefined" ? __GIT_HASH__ : "dev";

// Match the gate Sentry itself uses (utility/sentry.js): Sentry is only
// initialized for stage/production, so missing-key reporting is meaningful
// only there. Everything else (development, local) is a dev surface where we
// crash hard on a missing key (see handleMissingKey).
const isReportingEnv = ["stage", "production"].includes(__CONFIG__?.ENV ?? "");

// Disable the en-US fallback in dev so a key missing from the *active* locale
// resolves to nothing and trips handleMissingKey (which throws). With the
// fallback on, a key present in en-US but missing in another locale would
// silently render the English value and the gap would go undetected — the
// opposite of the goal. Stage/production keep the fallback so real users never
// see a raw key; gaps there are reported to Sentry instead.
const fallbackLng = isReportingEnv ? "en-US" : false;

// With the fallback off, i18next has nothing to fall back to when the language
// detector comes up empty (e.g. cleared localStorage), so it would init with
// an *undefined* language and crash on the first lookup. Pin an explicit
// initial language in dev — the stored locale if present, else en-US — which
// mirrors exactly what the localStorage detector would have resolved. In
// stage/production the fallback already guarantees a language, so we let the
// detector run as before.
const devInitialLng = isReportingEnv
  ? undefined
  : (typeof localStorage !== "undefined" &&
      localStorage.getItem("app_locale")) ||
    "en-US";

// Dedupe Sentry reports so a missing key in a frequently-rerendered component
// doesn't blow through the Sentry quota. Only used on the reporting path —
// the dev path always throws (never dedupes) so the error boundary keeps
// surfacing it on every render until the key is added.
const reportedMissingKeys = new Set<string>();

/**
 * Phase 6 — missing key handling. The goal is full translation coverage: every
 * key must exist in every locale, never papered over by the en-US fallback.
 *
 * - Dev (development/local): throw. A key absent from the active locale's
 *   `public/locales/<lng>/<ns>.json` (fallback is off in dev) crashes the app
 *   with the exact key and file path, so the gap is impossible to miss — no
 *   need to scan the console. The non-English locales are translated
 *   incrementally, so an incomplete locale is *meant* to be unusable in dev
 *   until every key is filled in.
 * - Stage/production: the fallback is on, so this fires only for keys missing
 *   from the whole chain (including en-US). Report to Sentry once per key
 *   (deduped) and let i18next fall back so the UI never breaks for users.
 */
const handleMissingKey = (
  lngs: readonly string[],
  ns: string,
  key: string,
  fallbackValue: string
): void => {
  const qualifiedKey = `${ns}.${key}`;

  // A namespace that hasn't finished loading (lazy sub-app namespaces load on
  // first navigation) is a timing artifact, not a missing key — skip it so we
  // don't crash on a load that's still in flight. An empty placeholder file is
  // still "loaded" (just keyless), so this correctly throws for every key in,
  // e.g., an untranslated es-ES namespace.
  if (lngs.some((lng) => !lng || !i18n.hasResourceBundle(lng, ns))) {
    return;
  }

  if (isReportingEnv) {
    const dedupeKey = `${lngs.join(",")}:${qualifiedKey}`;
    if (reportedMissingKeys.has(dedupeKey)) {
      return;
    }
    reportedMissingKeys.add(dedupeKey);

    Sentry.captureMessage(`Missing translation key: ${qualifiedKey}`, {
      level: "warning",
      tags: { i18n_namespace: ns },
      extra: { key, namespace: ns, languages: lngs, fallbackValue },
    });
    return;
  }

  const paths = lngs
    .map((lng) => `public/locales/${lng}/${ns}.json`)
    .join(", ");
  throw new Error(
    `[i18n] Missing translation key "${qualifiedKey}" for [${lngs.join(
      ", "
    )}]. Add it to ${paths}.`
  );
};

// Single source of truth for the supported locale tags. `SupportedLocale` is
// derived from this so other modules (e.g. the date-fns locale map) can be
// type-checked against it — adding a tag here surfaces gaps elsewhere via tsc.
export const SUPPORTED_LOCALES = [
  "en-US",
  "es-ES",
  "hi-IN",
  "zh-CN",
  "ru-RU",
  "nl-NL",
] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

i18n
  .use(ChainedBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng,
    // Only set in dev (undefined in stage/production, where the detector +
    // fallback handle it). See devInitialLng above.
    lng: devInitialLng,
    supportedLngs: [...SUPPORTED_LOCALES],

    ns: ["common", "shell"],
    defaultNS: "common",

    backend: {
      backends: [LocalStorageBackend, HttpBackend],
      backendOptions: [
        {
          prefix: "i18next_res_",
          defaultVersion: gitHash,
        },
        {
          loadPath: "/locales/{{lng}}/{{ns}}.json",
        },
      ],
    },

    detection: {
      order: ["localStorage"],
      // caches intentionally omitted — we write app_locale manually on explicit
      // changeLanguage() calls only, to prevent auto-write on fallback detection
      caches: [],
      lookupLocalStorage: "app_locale",
    },

    nsSeparator: ".",
    keySeparator: false,

    // Missing key handling. `saveMissing` is required for
    // `missingKeyHandler` to fire. Providing the handler short-circuits the
    // default backend save, so no network POST is attempted for missing keys.
    // `saveMissingTo: "current"` reports against the locale actually being
    // viewed (e.g. es-ES), not the fallback, which is what we want now that
    // the fallback is off in dev.
    saveMissing: true,
    saveMissingTo: "current",
    missingKeyHandler: handleMissingKey,

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: true,
    },
  });

export default i18n;
