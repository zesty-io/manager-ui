import { ConnectField, ConnectSource } from "../hooks/studioTypes";
import { getFieldMeta } from "./studioFieldMeta";

// ---------------------------------------------------------------------------
// The ONLY place in Studio that writes or reads a Parsley reference.
//
// A reference varies on two axes:
//   WHERE it resolves from — `this` (the item rendering the region) or another
//                            item pinned by ZUID via `<model>.filter(<zuid>)`
//   HOW it renders         — verbatim, `.getImage()` to turn a media asset into
//                            a URL, or `.getUrl()` for the ITEM's own page URL
//
// Both directions live here on purpose. The sibling app-freestyle repo built
// and parsed Parsley in five separate places and they drifted: its image parser
// (StyleSettings/ImageSettings.jsx) matches neither `first()` nor `filter()`, so
// a cross-item image binding there never renders its chip and can't be cleared.
// One regex covering every axis is what stops that recurring.
// ---------------------------------------------------------------------------

// Which of the three forms a reference takes:
//   "field" — `{{this.title}}`, the value verbatim
//   "media" — `{{this.hero.getImage()}}`, a media asset resolved to a URL
//   "url"   — `{{about.filter(7-abc-123).getUrl()}}`, the ITEM's own page URL
export type ParsleyRefKind = "field" | "media" | "url";

// What buildParsley needs. A field reference derives its kind from `datatype`
// (media gets the `.getImage()` suffix); a "url" reference is item-level and
// carries no field at all, so it is asked for explicitly — being a link target
// is a property of the SLOT, not of anything on the item.
export type ParsleyRef =
  | {
      kind?: "field";
      // Field name — the Parsley key, not the label.
      name: string;
      // Absent => `{{this.<name>}}`.
      source?: Pick<ConnectSource, "modelName" | "itemZUID">;
      datatype?: string | null;
    }
  | {
      kind: "url";
      // Absent => `{{this.getUrl()}}` — the page currently being rendered.
      source?: Pick<ConnectSource, "modelName" | "itemZUID">;
    };

// What parseParsleyRef yields. Deliberately NOT ParsleyRef: a parse reads the
// method suffix off the string and cannot know the field's datatype.
export type ParsedParsleyRef = {
  // Empty for kind "url" — an item-level reference names no field.
  name: string;
  // Absent => the reference was `this.<…>`.
  source?: { modelName: string; itemZUID: string };
  // Which method the expression carried, read off the string.
  kind: ParsleyRefKind;
};

// A model or field name: anything up to the next structural delimiter.
//
// Deliberately NOT `\w+`. Names made through the manager go through
// formatName(), which strips everything outside [a-z0-9_] — but names created
// straight through the API or a JS SDK never pass through it, and hyphenated
// fields like `node-sdk_updateItem_1733876716599` genuinely exist on real
// instances. We're parsing template text we did not write, so match on the
// delimiters we DO control rather than on an assumed alphabet.
const NAME = "[^.\\s{}()]+";

// {{this.title}}                             | {{this.hero.getImage()}}
// {{about.filter(7-abc-123).company_name}}   | {{about.filter(7-abc-123).logo.getImage()}}
// {{about.filter(7-abc-123).getUrl()}}
//
// Also tolerant of whitespace anywhere an author might put it — byte-identity
// is not available to us the way it was when the panel only ever compared
// against its own generated strings.
const PARSLEY_REF_RE = new RegExp(
  "^\\s*\\{\\{\\s*" +
    // `this`, or another item pinned by ZUID
    `(?:this|(${NAME})\\s*\\.\\s*filter\\(\\s*([^)\\s]+)\\s*\\))\\s*\\.\\s*` +
    // Either the item's own page URL — getUrl() takes no field segment — or a
    // field, optionally resolved to a media URL. NAME excludes parentheses, so
    // the two branches can't both match the same text.
    `(?:getUrl\\(\\s*\\)|(${NAME})\\s*(\\.\\s*getImage\\(\\s*\\))?)` +
    // anything beyond those methods stays unparsed
    "\\s*\\}\\}\\s*$"
);

// A media asset needs getImage() to resolve to a URL; a link target needs
// getUrl() on the item and no field segment at all; every other field (text, an
// external-URL link, …) is referenced verbatim.
export const buildParsley = (ref: ParsleyRef): string => {
  const base = ref.source
    ? `${ref.source.modelName}.filter(${ref.source.itemZUID})`
    : "this";
  // getUrl() is a default method on the ITEM, so there is nothing to name after
  // it. Only resolves for models that have a view — the item picker is what
  // keeps datasets out.
  if (ref.kind === "url") return `{{${base}.getUrl()}}`;
  const method =
    getFieldMeta(ref.datatype).category === "media" ? ".getImage()" : "";
  return `{{${base}.${ref.name}${method}}}`;
};

export const parseParsleyRef = (value: string): ParsedParsleyRef | null => {
  const match = (value || "").match(PARSLEY_REF_RE);
  if (!match) return null;

  const [, modelName, itemZUID, name, imageMethod] = match;
  return {
    // No captured name means the getUrl() branch matched.
    name: name || "",
    kind: !name ? "url" : imageMethod ? "media" : "field",
    ...(modelName && itemZUID ? { source: { modelName, itemZUID } } : {}),
  };
};

// The panel's currency is a ConnectField, so give it a direct entry point.
export const connectFieldToParsley = (field: ConnectField): string =>
  buildParsley({
    name: field.name,
    datatype: field.datatype,
    source: field.source,
  });
