import { getElementAttrs, attributes } from "./index.js";

// :: NodeSpec A heading textblock, with a `level` attribute that
// should hold the number 1 to 6. Parsed and serialized as `<h1>` to
// `<h6>` elements.
export const heading = {
  attrs: { ...attributes(), level: { default: 1 } },
  content: "inline*",
  group: "block",
  defining: true,
  parseDOM: [
    {
      tag: "h1",
      getAttrs(dom) {
        const attrs = getElementAttrs(dom);
        return { ...attrs, level: 1 };
      },
    },
    {
      tag: "h2",
      getAttrs(dom) {
        const attrs = getElementAttrs(dom);
        return { ...attrs, level: 2 };
      },
    },
    {
      tag: "h3",
      getAttrs(dom) {
        const attrs = getElementAttrs(dom);
        return { ...attrs, level: 3 };
      },
    },
    {
      tag: "h4",
      getAttrs(dom) {
        const attrs = getElementAttrs(dom);
        return { ...attrs, level: 4 };
      },
    },
    {
      tag: "h5",
      getAttrs(dom) {
        const attrs = getElementAttrs(dom);
        return { ...attrs, level: 5 };
      },
    },
    {
      tag: "h6",
      getAttrs(dom) {
        const attrs = getElementAttrs(dom);
        return { ...attrs, level: 6 };
      },
    },
  ],
  toDOM(node) {
    return ["h" + node.attrs.level, { ...node.attrs, level: null }, 0];
  },
};
