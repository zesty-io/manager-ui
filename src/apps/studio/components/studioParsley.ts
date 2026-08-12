import { ConnectField, ConnectSource } from "../hooks/studioTypes";
import { getFieldMeta } from "./studioFieldMeta";

// ---------------------------------------------------------------------------
// The ONLY place in Studio that writes or reads a Parsley reference.
//
// A reference varies on two axes:
//   WHERE it resolves from — `this` (the item rendering the region) or another
//                            item pinned by ZUID via `<model>.filter(<zuid>)`
//   HOW it renders         — verbatim, or `.getImage()` to turn a media asset
//                            into a URL
//
// Both directions live here on purpose. The sibling app-freestyle repo built
// and parsed Parsley in five separate places and they drifted: its image parser
// (StyleSettings/ImageSettings.jsx) matches neither `first()` nor `filter()`, so
// a cross-item image binding there never renders its chip and can't be cleared.
// One regex covering every axis is what stops that recurring.
// ---------------------------------------------------------------------------

// What buildParsley needs. `datatype` decides the `.getImage()` suffix.
export type ParsleyRef = {
  // Field name — the Parsley key, not the label.
  name: string;
  // Absent => `{{this.<name>}}`.
  source?: Pick<ConnectSource, "modelName" | "itemZUID">;
  datatype?: string | null;
};

// What parseParsleyRef yields. Deliberately NOT ParsleyRef: a parse reads the
// method suffix off the string and cannot know the field's datatype.
export type ParsedParsleyRef = {
  name: string;
  // Absent => the reference was `this.<name>`.
  source?: { modelName: string; itemZUID: string };
  // The literal `.getImage()` was present.
  isMedia: boolean;
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
//
// Also tolerant of whitespace anywhere an author might put it — byte-identity
// is not available to us the way it was when the panel only ever compared
// against its own generated strings.
const PARSLEY_REF_RE = new RegExp(
  "^\\s*\\{\\{\\s*" +
    // `this`, or another item pinned by ZUID
    `(?:this|(${NAME})\\s*\\.\\s*filter\\(\\s*([^)\\s]+)\\s*\\))` +
    `\\s*\\.\\s*(${NAME})\\s*` +
    // the only method we understand; anything else stays unparsed
    "(\\.\\s*getImage\\(\\s*\\))?\\s*\\}\\}\\s*$"
);

// A media asset needs getImage() to resolve to a URL; every other field (text,
// an external-URL link, …) is referenced verbatim. One rule covers both
// dropdowns: media slots mix the two, text slots only ever hold the plain form.
export const buildParsley = (ref: ParsleyRef): string => {
  const base = ref.source
    ? `${ref.source.modelName}.filter(${ref.source.itemZUID})`
    : "this";
  const method =
    getFieldMeta(ref.datatype).category === "media" ? ".getImage()" : "";
  return `{{${base}.${ref.name}${method}}}`;
};

export const parseParsleyRef = (value: string): ParsedParsleyRef | null => {
  const match = (value || "").match(PARSLEY_REF_RE);
  if (!match) return null;

  const [, modelName, itemZUID, name, imageMethod] = match;
  return {
    name,
    isMedia: Boolean(imageMethod),
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
