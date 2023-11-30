import { getElementAttrs, attributes } from "./index.js";

// :: NodeSpec A plain paragraph textblock. Represented in the DOM
// as a `<p>` element.
export const paragraph = {
  content: "inline*",
  group: "block",
  attrs: attributes(),
  parseDOM: [
    {
      tag: "p",
      getAttrs(dom) {
        return getElementAttrs(dom);
      },
    },
  ],
  toDOM(node) {
    return ["p", node.attrs, 0];
  },
};
