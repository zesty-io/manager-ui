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

// Stage/production get user-safe behavior: fallback copy, Sentry reporting, and
// localStorage-backed translation caching. Development/local get strict,
// fresh-from-HTTP behavior so locale JSON edits show up after a refresh.
const isProductionLikeEnv = ["stage", "production"].includes(
  __CONFIG__?.ENV ?? ""
);

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

// Maps any browser language tag to the nearest supported locale by first trying
// an exact match, then falling back to a base-language prefix match (e.g. "en"
// → "en-US", "zh-TW" → "zh-CN"), then to "en-US".
export function toSupportedLocale(lng: string): SupportedLocale {
  if (SUPPORTED_LOCALES.includes(lng as SupportedLocale)) {
    return lng as SupportedLocale;
  }
  const base = lng.split("-")[0];
  return SUPPORTED_LOCALES.find((s) => s.startsWith(base)) ?? "en-US";
}

// Fallback off in dev so missing keys always trip handleMissingKey instead of
// silently resolving to English. Prod keeps it so users never see raw keys.
const fallbackLng = isProductionLikeEnv ? "en-US" : false;

// Without a fallback, an empty detector result leaves i18next with no language
// and crashes on the first lookup. Pin the resolved locale in dev using the
// same priority order as prod: localStorage → navigator → en-US.
function resolveDevLng(): string {
  if (typeof localStorage !== "undefined") {
    const stored = localStorage.getItem("app_locale");
    if (stored) {
      return stored;
    }
  }
  if (typeof navigator !== "undefined") {
    return toSupportedLocale(navigator.language);
  }
  return "en-US";
}

const devInitialLng = isProductionLikeEnv ? undefined : resolveDevLng();

// Dedupe Sentry reports — the dev path always throws instead.
const reportedMissingKeys = new Set<string>();

const handleMissingKey = (
  lngs: readonly string[],
  ns: string,
  key: string,
  fallbackValue: string
): void => {
  const qualifiedKey = `${ns}.${key}`;
  // With useSuspense: true a correctly-declared namespace suspends before t()
  // is called, so reaching here with an unloaded namespace means the component
  // never called useTranslation("ns").
  const nsUnloaded = lngs.some(
    (lng) => !lng || !i18n.hasResourceBundle(lng, ns)
  );

  if (!isProductionLikeEnv) {
    if (nsUnloaded) {
      throw new Error(
        `[i18n] Namespace "${ns}" is not loaded. ` +
          `Declare it in your component: useTranslation("${ns}").`
      );
    }
    const paths = lngs
      .map((lng) => `public/locales/${lng}/${ns}.json`)
      .join(", ");
    throw new Error(
      `[i18n] Missing translation key "${qualifiedKey}" for [${lngs.join(
        ", "
      )}]. Add it to ${paths}.`
    );
  }

  if (nsUnloaded) {
    return;
  }

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
};

// Stage/production use the chained backend for localStorage caching. Dev/local
// use HTTP directly so locale JSON edits are not hidden by stale
// `i18next_res_*` entries.
if (isProductionLikeEnv) {
  i18n.use(ChainedBackend);
} else {
  i18n.use(HttpBackend);
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng,
    // Only set in dev (undefined in stage/production, where the detector +
    // fallback handle it). See devInitialLng above.
    lng: devInitialLng,
    supportedLngs: [...SUPPORTED_LOCALES],

    ns: [
      "common",
      "shell",
      "content",
      "media",
      "release",
      "code",
      "schema",
      "seo",
      "settings",
      "reports",
      "dashboard",
      "leads",
      "marketplace",
      "blocks",
      "activePreview",
    ],
    defaultNS: "common",

    backend: isProductionLikeEnv
      ? {
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
        }
      : {
          loadPath: "/locales/{{lng}}/{{ns}}.json",
        },

    detection: {
      order: ["localStorage", "navigator"],
      // caches intentionally omitted — we write app_locale manually on explicit
      // changeLanguage() calls only, to prevent auto-write on fallback detection
      caches: [],
      lookupLocalStorage: "app_locale",
      convertDetectedLanguage: toSupportedLocale,
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
  })
  .then(() => {
    Sentry.setTag("locale", i18n.language);
  });

// Keeps the Sentry tag in sync with every subsequent changeLanguage() call
// (e.g. load-instance resolving the logged-in user's saved locale, or a
// settings-page language switcher), not just the initial detection above.
i18n.on("languageChanged", (lng) => {
  Sentry.setTag("locale", lng);
});

export default i18n;
