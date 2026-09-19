import i18n from "../shell/i18n";

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
  BynderCompactView.open({
    portal: { url },
    mode,
    language: getBynderLanguage(),
    onSuccess,
  });
};
