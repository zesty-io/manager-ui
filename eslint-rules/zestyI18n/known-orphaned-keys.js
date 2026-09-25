"use strict";

// Single source of truth shared by eslint-rules/zestyI18n/key-format.js
// (call-site format/existence checks) and scripts/lint-i18n-locales.js (locale-JSON
// format checks) — see PR description for #4333 for why these two checks
// must agree on the same exemption list instead of maintaining it twice.
//
// Pre-existing keys in settings.json with no static `t("settings.Foo")`
// call site — but they ARE live: Instance.js builds the key dynamically
// as `settings.${toPascalCase(field.key)}` (e.g. site_protocol ->
// SiteProtocol) for every settings field label, so a static grep for the
// key looks unreferenced even though it renders, and the PascalCase form
// (not this repo's usual camelCase) is intentional to match that
// conversion, not a mistake to "fix".
module.exports = {
  "settings.json": new Set([
    "AddLangCodeToPaths",
    "AjaxCorsAllowAnyOrigin",
    "AlwaysRedirectToHttps",
    "AutoIncludeJsInHead",
    "AutomatedFeedXml",
    "BaseDirectory",
    "BasicContentApiEnabled",
    "CanonicalTagsEnabled",
    "ClientKey",
    "Collection",
    "ContentSecurityPolicy",
    "DefaultPage",
    "Dev",
    "DisplayAdvertisingSupport",
    "DntPolicy",
    "FeaturePolicy",
    "FriendlyPagination",
    "GoogleAutoLinker",
    "GoogleUrchinId",
    "Gql",
    "GqlOrigin",
    "GtmId",
    "Honeypot",
    "Live",
    "LoadFontAwesome",
    "MediaProxyUrl",
    "OverwriteHead",
    "PreferredDomainPrefix",
    "PreviewLock",
    "PreviewLockPassword",
    "ReferrerPolicy",
    "RobotsOn",
    "RobotsText",
    "SafeEmails",
    "SendingEmail",
    "ShowDomainInTitle",
    "ShowInTitle",
    "SiteProtocol",
    "StrictTransportSecurity",
    "UniversalCode",
    "Url",
    "XContentTypeOptions",
    "XFrameOptions",
  ]),
};
