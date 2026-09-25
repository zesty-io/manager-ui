"use strict";

const fs = require("fs");
const path = require("path");

// Shared with scripts/lint-i18n-locales.js — dynamically-built keys that are legitimately PascalCase.
const KNOWN_ORPHANED_KEYS = require("./known-orphaned-keys");

// Enforces this repo's i18next key convention at call sites — see CLAUDE.md > Localization > Key syntax.
// Only literal string keys are checked; computed keys are out of scope.

// namespace.camelCaseKey, exactly one dot.
const KEY_FORMAT = /^[a-z][a-zA-Z0-9]*\.[a-z][a-zA-Z0-9]*$/;

const FORMAT_MESSAGE =
  'i18next key "{{key}}" must be "namespace.camelCaseKey" — flat camelCase with exactly one dot.';
const RICH_CALL_MESSAGE =
  'i18next key "{{key}}" ends in "Rich" (contains a component placeholder) — use <Trans i18nKey="{{key}}"> instead of calling t()/i18n.t() with it directly.';
const MISSING_KEY_MESSAGE =
  'i18next key "{{key}}" is not defined in public/locales/en-US/{{ns}}.json.';

const LOCALES_DIR = path.join(
  __dirname,
  "..",
  "..",
  "public",
  "locales",
  "en-US"
);
// CLDR plural categories: "<key>_<suffix>" in the locale JSON.
const PLURAL_SUFFIXES = ["_zero", "_one", "_two", "_few", "_many", "_other"];

const nsKeysCache = new Map();

function loadNamespaceKeys(ns) {
  if (nsKeysCache.has(ns)) return nsKeysCache.get(ns);
  let keys = null;
  try {
    const raw = fs.readFileSync(path.join(LOCALES_DIR, `${ns}.json`), "utf8");
    keys = new Set(Object.keys(JSON.parse(raw)));
  } catch (e) {
    // Missing/unparseable — skip the existence check.
    keys = null;
  }
  nsKeysCache.set(ns, keys);
  return keys;
}

function keyExistsInNamespace(keys, key) {
  if (keys.has(key)) return true;
  return PLURAL_SUFFIXES.some((suffix) => keys.has(key + suffix));
}

function isTMemberExpression(node, objectName) {
  return (
    node.type === "MemberExpression" &&
    !node.computed &&
    node.property.type === "Identifier" &&
    node.property.name === "t" &&
    node.object.type === "Identifier" &&
    node.object.name === objectName
  );
}

function isTranslationCallee(node) {
  if (node.type === "Identifier" && node.name === "t") {
    return true;
  }
  // i18n.t(...) — used outside React components.
  if (isTMemberExpression(node, "i18n")) {
    return true;
  }
  // this.props.t(...) — class components wrapped with withTranslation().
  if (
    node.type === "MemberExpression" &&
    !node.computed &&
    node.property.type === "Identifier" &&
    node.property.name === "t" &&
    node.object.type === "MemberExpression" &&
    !node.object.computed &&
    node.object.object.type === "ThisExpression" &&
    node.object.property.type === "Identifier" &&
    node.object.property.name === "props"
  ) {
    return true;
  }
  return false;
}

function checkLiteralKey(context, node, key) {
  const dotIndex = key.indexOf(".");
  const ns = dotIndex === -1 ? null : key.slice(0, dotIndex);
  const rest = dotIndex === -1 ? null : key.slice(dotIndex + 1);
  const orphaned = ns && KNOWN_ORPHANED_KEYS[`${ns}.json`];
  const isKnownOrphaned = !!(orphaned && rest && orphaned.has(rest));

  if (!isKnownOrphaned && !KEY_FORMAT.test(key)) {
    context.report({ node, messageId: "format", data: { key } });
    return;
  }
  if (!ns) return;
  const nsKeys = loadNamespaceKeys(ns);
  if (nsKeys && !keyExistsInNamespace(nsKeys, rest)) {
    context.report({ node, messageId: "missing", data: { key, ns } });
  }
}

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        "enforce this repo's flat-camelCase, single-dot i18next key convention",
    },
    schema: [],
    messages: {
      format: FORMAT_MESSAGE,
      richCall: RICH_CALL_MESSAGE,
      missing: MISSING_KEY_MESSAGE,
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (!isTranslationCallee(node.callee)) return;
        const arg = node.arguments[0];
        if (!arg || arg.type !== "Literal" || typeof arg.value !== "string") {
          return;
        }
        const key = arg.value;
        checkLiteralKey(context, arg, key);
        if (/Rich$/.test(key)) {
          context.report({
            node: arg,
            messageId: "richCall",
            data: { key },
          });
        }
      },
      JSXAttribute(node) {
        if (node.name.name !== "i18nKey") return;
        const value = node.value;
        if (!value) return;
        let literal = null;
        if (value.type === "Literal") {
          literal = value;
        } else if (
          value.type === "JSXExpressionContainer" &&
          value.expression.type === "Literal"
        ) {
          literal = value.expression;
        }
        if (!literal || typeof literal.value !== "string") return;
        checkLiteralKey(context, literal, literal.value);
      },
    };
  },
};
