// import { tableNodes } from "prosemirror-tables";
import { getElementAttrs, attributes } from "./index.js";
const attrs = attributes();

// const nodes = tableNodes({
//   tableGroup: "block",
//   cellContent: "block+"
// });
//
// nodes["table"].attrs = { ...attrs, width: { default: null } };
// nodes["table_cell"].attrs = nodes["table_header"].attrs = {
//   ...attrs,
//   colspan: { default: 1 },
//   rowspan: { default: 1 },
//   colwidth: { default: null },
//   headers: { default: null }
// };
//
// console.log("tableNodes", nodes);
//
// export default nodes;

/**
  Override `prosemirror-tables` node definitions to provide custom
  attributes. Requires providing the `tableRole` property for
  the plugins to work.
  @see https://github.com/prosemirror/prosemirror-tables/
**/

// console.log("default attrs", attrs);

export const table = {
  content: "(colgroup | caption | table_body)+",
  // content: "table_row+",
  tableRole: "table",
  isolating: true,
  group: "block",
  attrs: { ...attrs, width: { default: null } },
  parseDOM: [
    {
      tag: "table",
      getAttrs(dom) {
        return getElementAttrs(dom);
      },
    },
  ],
  toDOM(node) {
    // return ["table", ["tbody", 0]];
    return ["table", node.attrs, 0];
  },
};

export const table_body = {
  content: "table_row+",
  tableRole: "table_body",
  // isolating: true,
  group: "block",
  attrs: attrs,
  parseDOM: [
    {
      tag: "tbody",
      getAttrs(dom) {
        return getElementAttrs(dom);
      },
    },
  ],
  toDOM(node) {
    return ["tbody", node.attrs, 0];
  },
};

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tr
 */
export const caption = {
  content: "inline*",
  attrs: attrs,
  parseDOM: [
    {
      tag: "caption",
      getAttrs(dom) {
        return getElementAttrs(dom);
      },
    },
  ],
  toDOM(node) {
    return ["caption", node.attrs, 0];
  },
};

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/tr
 */
export const table_row = {
  content: "(table_cell | table_header)*",
  tableRole: "row",
  attrs: attrs,
  parseDOM: [
    {
      tag: "tr",
      getAttrs(dom) {
        return getElementAttrs(dom);
      },
    },
  ],
  toDOM(node) {
    return ["tr", node.attrs, 0];
  },
};

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/td
 */
export const table_cell = {
  content: "block+",
  tableRole: "cell",
  attrs: {
    ...attrs,
    colspan: { default: 1 },
    rowspan: { default: 1 },
    // colwidth: { default: null },
    headers: { default: null },
  },
  isolating: true,
  parseDOM: [
    {
      tag: "td",
      getAttrs(dom) {
        return getElementAttrs(dom);
      },
    },
  ],
  toDOM(node) {
    return ["td", node.attrs, 0];
  },
};

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/th
 */
export const table_header = {
  content: "block+",
  tableRole: "header_cell",
  attrs: {
    ...attrs,
    abbr: { default: null },
    colspan: { default: 1 },
    rowspan: { default: 1 },
    // colwidth: { default: null },
    scope: { default: null },
  },
  isolating: true,
  parseDOM: [
    {
      tag: "th",
      getAttrs(dom) {
        return getElementAttrs(dom);
      },
    },
  ],

  toDOM(node) {
    return ["th", node.attrs, 0];
  },
};

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/colgroup
 */
export const colgroup = {
  content: "col+",
  attrs: { ...attrs, span: { default: null } },
  parseDOM: [
    {
      tag: "colgroup",
      getAttrs(dom) {
        return getElementAttrs(dom);
      },
    },
  ],
  toDOM(node) {
    return ["colgroup", { ...node.attrs }, 0];
  },
};

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/col
 */
export const col = {
  attrs: {
    ...attrs,
    span: { default: null },
    width: { default: null },
  },
  parseDOM: [
    {
      tag: "col",
      getAttrs(dom) {
        return getElementAttrs(dom);
      },
    },
  ],
  toDOM(node) {
    return ["col", { ...node.attrs }];
  },
};

export default {
  table,
  table_body,
  table_row,
  table_cell,
  table_header,
  caption,
  colgroup,
  col,
};
