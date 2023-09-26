import { getElementAttrs, attributes } from "./index.js";

// :: NodeSpec A horizontal rule (`<hr>`).
export const hr = {
  group: "block",
  attrs: attributes(),
  parseDOM: [
    {
      tag: "hr",
      getAttrs(dom) {
        return getElementAttrs(dom);
      },
    },
  ],
  toDOM(node) {
    return ["hr", node.attrs];
  },
};
