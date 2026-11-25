import * as Sentry from "@sentry/react";
import i18n from "../shell/i18n";
import { store } from "shell/store";
import { notify } from "shell/store/notifications";

const BYNDER_SCRIPT_URL =
  "https://ucv.bynder.com/5.0.5/modules/compactview/bynder-compactview-3-latest.js";

let bynderScriptPromise: Promise<void> | null = null;
// Ignore clicks while the first load is pending so the picker can't open twice.
let isOpening = false;

// Inject the SDK once; a failed load clears the memo so a later click retries.
const loadBynderScript = () => {
  if (!bynderScriptPromise) {
    bynderScriptPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = BYNDER_SCRIPT_URL;
      script.async = true;
      const fail = () => {
        script.remove();
        bynderScriptPromise = null;
        reject(new Error("Failed to load the Bynder Compact View script"));
      };
      // A blocked or stubbed response can fire onload without defining the global.
      script.onload = () =>
        typeof BynderCompactView === "undefined" ? fail() : resolve();
      script.onerror = fail;
      document.head.appendChild(script);
    });
  }

  return bynderScriptPromise;
};

// Tag the stage so Sentry separates SDK load failures from `open` throwing.
const reportBynderFailure = (stage: "script" | "open", error: unknown) => {
  Sentry.captureException(error, {
    tags: { bynder_failure: stage },
    fingerprint: ["bynder-failure", stage],
  });
  store.dispatch(
    notify({ kind: "error", message: i18n.t("shell.bynderLoadFailed") })
  );
};

// Bynder Compact View has two SDK-owned locale paths: the `language` option
// accepts underscore IDs, then the modal also fetches
// `/modules/compactview/i18n/{firstTwoLetters}.json` from Bynder CloudFront.
// In the current SDK only en/es/nl have those external files available for our
// supported locales. zh/ru/hi return 403, and the SDK does not expose a custom
// localization/messages object, so unsupported locales intentionally fall back.
const bynderLanguageByLocale: Record<string, string> = {
  "en-US": "en_US",
  "es-ES": "es_ES",
  "zh-CN": "en_US",
  "ru-RU": "en_US",
  "nl-NL": "nl_NL",
  "hi-IN": "en_US",
};

const getBynderLanguage = () =>
  bynderLanguageByLocale[i18n.language] ?? "en_US";

export default ({
  url,
  onSuccess = () => {},
  mode = "MultiSelect",
}: {
  url: string;
  onSuccess?: (assets: ReadonlyArray<BynderImage>) => void;
  mode?: BynderMode;
}) => {
  if (isOpening) return;
  isOpening = true;

  loadBynderScript()
    .then(
      () => {
        try {
          BynderCompactView.open({
            portal: { url },
            mode,
            language: getBynderLanguage(),
            onSuccess,
          });
        } catch (error) {
          reportBynderFailure("open", error);
        }
      },
      (error) => reportBynderFailure("script", error)
    )
    .finally(() => {
      isOpening = false;
    });
};
