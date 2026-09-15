import { startCase } from "lodash";

// Maps a raw instance-settings `category` value to its settings.json i18n key.
// "Proxy" and "proxy" both resolve through the lowercase "proxy" entry since
// they're the same category with a casing mismatch in the source data.
const CATEGORY_TRANSLATION_KEYS: Record<string, string> = {
  Exporter: "categoryExporter",
  "For Custom Endpoint ": "categoryForCustomEndpoint",
  Overrides: "categoryOverrides",
  proxy: "categoryProxy",
  analytics: "categoryAnalytics",
  blog: "categoryBlog",
  bynder: "categoryBynder",
  "contact-form": "categoryContactForm",
  custom: "categoryCustom",
  developer: "categoryDeveloper",
  extensions: "categoryExtensions",
  general: "categoryGeneral",
  groupby: "categoryGroupby",
  i18n: "categoryI18n",
  integrations: "categoryIntegrations",
  "logo-section": "categoryLogoSection",
  logosection: "categoryLogosection",
  petdesk: "categoryPetdesk",
  routing: "categoryRouting",
  security: "categorySecurity",
  seo: "categorySeo",
  sitelink: "categorySitelink",
  "social-links": "categorySocialLinks",
  stripe: "categoryStripe",
  tag_managers: "categoryTagManagers",
  twitter: "categoryTwitter",
  ups: "categoryUps",
  verification: "categoryVerification",
  youtube: "categoryYoutube",
};

// Translates a raw `category` value for display, falling back to the existing
// startCase behavior for any category that hasn't been added to the map above.
export const getCategoryLabel = (
  category: string,
  t: (key: string) => string
): string => {
  const i18nKey = CATEGORY_TRANSLATION_KEYS[category];
  return i18nKey
    ? t(`settings.${i18nKey}`)
    : startCase(category.replace(/_|-/g, " "));
};

// Maps a raw style category `name` (from the styles API) to its settings.json i18n key.
const STYLE_CATEGORY_TRANSLATION_KEYS: Record<string, string> = {
  "Body Colors & Spacing": "styleCategoryBodyColorsSpacing",
  Typography: "styleCategoryTypography",
  "Responsive Grid": "styleCategoryResponsiveGrid",
  "HTML Elements": "styleCategoryHtmlElements",
  Links: "styleCategoryLinks",
  Navigation: "styleCategoryNavigation",
  Sidebar: "styleCategorySidebar",
  Buttons: "styleCategoryButtons",
  "Interactive Elements": "styleCategoryInteractiveElements",
  Forms: "styleCategoryForms",
  "UI Styling": "styleCategoryUiStyling",
};

// Translates a raw style category `name` for display, falling back to the raw
// name itself (what's currently displayed) for any name not in the map above.
export const getStyleCategoryLabel = (
  name: string,
  t: (key: string) => string
): string => {
  const i18nKey = STYLE_CATEGORY_TRANSLATION_KEYS[name];
  return i18nKey ? t(`settings.${i18nKey}`) : name;
};
