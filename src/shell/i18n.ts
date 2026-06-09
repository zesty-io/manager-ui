import i18n from "i18next";
import ChainedBackend from "i18next-chained-backend";
import LocalStorageBackend from "i18next-localstorage-backend";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

declare const __GIT_HASH__: string;

const gitHash = typeof __GIT_HASH__ !== "undefined" ? __GIT_HASH__ : "dev";

i18n
  .use(ChainedBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en-US",
    supportedLngs: ["en-US", "es-ES", "hi-IN", "zh-CN", "ru-RU", "nl-NL"],

    ns: ["common", "shell"],
    defaultNS: "common",

    backend: {
      backends: [LocalStorageBackend, HttpBackend],
      backendOptions: [
        {
          prefix: "i18next_res_",
          expirationTime: 24 * 60 * 60 * 1000,
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

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: true,
    },
  });

export default i18n;
