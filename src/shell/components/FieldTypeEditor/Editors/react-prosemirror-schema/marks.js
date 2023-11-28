import { attributes, getElementAttrs } from "./nodes";

const link = {
  attrs: {
    ...attributes(),
    href: {},
    target: { default: null },
  },
  inclusive: false,
  parseDOM: [
    {
      tag: "a[href]",
      getAttrs(dom) {
        return getElementAttrs(dom);
      },
    },
  ],
  toDOM(node) {
    return ["a", node.attrs, 0];
  },
};

// :: MarkSpec An emphasis mark. Rendered as an `<em>` element.
// Has parse rules that also match `<i>` and `font-style: italic`.
const em = {
  parseDOM: [{ tag: "i" }, { tag: "em" }, { style: "font-style=italic" }],
  toDOM() {
    return ["em", 0];
  },
};

// :: MarkSpec A strong mark. Rendered as `<strong>`, parse rules
// also match `<b>` and `font-weight: bold`.
const strong = {
  parseDOM: [
    { tag: "strong" },
    // This works around a Google Docs misbehavior where
    // pasted content will be inexplicably wrapped in `<b>`
    // tags with a font-weight normal.
    { tag: "b", getAttrs: (node) => node.style.fontWeight != "normal" && null },
    {
      style: "font-weight",
      getAttrs: (value) => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null,
    },
  ],
  toDOM() {
    return ["strong", 0];
  },
};

// :: MarkSpec Code font mark. Represented as a `<code>` element.
const code = {
  parseDOM: [{ tag: "code" }],
  toDOM() {
    return ["code", 0];
  },
};

const subscript = {
  excludes: "superscript",
  parseDOM: [{ tag: "sub" }, { style: "vertical-align=sub" }],
  toDOM: () => ["sub"],
};

const superscript = {
  excludes: "subscript",
  parseDOM: [{ tag: "sup" }, { style: "vertical-align=super" }],
  toDOM: () => ["sup"],
};

const strikethrough = {
  parseDOM: [
    { tag: "strike" },
    { style: "text-decoration=line-through" },
    { style: "text-decoration-line=line-through" },
  ],
  toDOM: () => [
    "del",
    {
      style: "text-decoration-line:line-through",
    },
  ],
};

const underline = {
  parseDOM: [{ tag: "u" }, { style: "text-decoration=underline" }],
  toDOM: () => [
    "span",
    {
      style: "text-decoration:underline",
    },
  ],
};

const indent = {
  parseDOM: [
    {
      style: "padding-left=30px",
    },
  ],
  toDOM: () => [
    "span",
    {
      style: "padding-left:30px",
    },
  ],
};

const alignLeft = {
  parseDOM: [{ style: "text-align=left" }],
  toDOM: () => [
    "span",
    {
      style: "display:block;text-align:left",
    },
  ],
};

const alignRight = {
  parseDOM: [{ style: "text-align=right" }],
  toDOM: () => [
    "span",
    {
      style: "display:block;text-align:right",
    },
  ],
};

const alignCenter = {
  parseDOM: [{ style: "text-align=center" }],
  toDOM: () => [
    "span",
    {
      style: "display:block;text-align:center",
    },
  ],
};

const alignJustify = {
  parseDOM: [{ style: "text-align=justify" }],
  toDOM: () => [
    "span",
    {
      style: "display:block;text-align:justify",
    },
  ],
};

const floatLeft = {
  parseDOM: [{ style: "float=left" }],
  toDOM: () => [
    "span",
    {
      style: "display:block;float:left",
    },
  ],
};

const floatRight = {
  parseDOM: [{ style: "float=right" }],
  toDOM: () => [
    "span",
    {
      style: "display:block;float:right",
    },
  ],
};

export default {
  link,
  em,
  strong,
  code,
  subscript,
  superscript,
  strikethrough,
  underline,
  indent,
  alignLeft,
  alignRight,
  alignCenter,
  alignJustify,
  floatLeft,
  floatRight,
};
