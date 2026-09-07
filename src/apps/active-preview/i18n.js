import i18n from "i18next";
import ChainedBackend from "i18next-chained-backend";
import LocalStorageBackend from "i18next-localstorage-backend";
import HttpBackend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

import { Sentry } from "utility/sentry";

const gitHash = typeof __GIT_HASH__ !== "undefined" ? __GIT_HASH__ : "dev";

const isProductionLikeEnv = ["stage", "production"].includes(
  __CONFIG__?.ENV ?? ""
);

const fallbackLng = isProductionLikeEnv ? "en-US" : false;

const reportedMissingKeys = new Set();

const handleMissingKey = (lngs, ns, key, fallbackValue) => {
  const qualifiedKey = `${ns}.${key}`;

  if (lngs.some((lng) => !lng || !i18n.hasResourceBundle(lng, ns))) {
    return;
  }

  if (isProductionLikeEnv) {
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

if (isProductionLikeEnv) {
  i18n.use(ChainedBackend);
} else {
  i18n.use(HttpBackend);
}

i18n.use(initReactI18next).init({
  lng: "en-US",
  fallbackLng,
  supportedLngs: ["en-US", "es-ES", "hi-IN", "zh-CN", "ru-RU", "nl-NL"],

  ns: ["activePreview", "common"],
  defaultNS: "activePreview",

  backend: isProductionLikeEnv
    ? {
        backends: [LocalStorageBackend, HttpBackend],
        backendOptions: [
          { prefix: "i18next_res_", defaultVersion: gitHash },
          { loadPath: "/locales/{{lng}}/{{ns}}.json" },
        ],
      }
    : {
        loadPath: "/locales/{{lng}}/{{ns}}.json",
      },

  nsSeparator: ".",
  keySeparator: false,

  saveMissing: true,
  saveMissingTo: "current",
  missingKeyHandler: handleMissingKey,

  interpolation: { escapeValue: false },

  react: { useSuspense: true },
});

export default i18n;
