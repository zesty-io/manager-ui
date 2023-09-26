import { getElementAttrs, attributes } from "./index.js";

export const div = {
  content: "block+",
  group: "block",
  attrs: attributes(),
  parseDOM: [
    {
      tag: "div",
      getAttrs(dom) {
        return getElementAttrs(dom);
      },
    },
  ],
  toDOM(node) {
    return ["div", node.attrs, 0];
  },
};
