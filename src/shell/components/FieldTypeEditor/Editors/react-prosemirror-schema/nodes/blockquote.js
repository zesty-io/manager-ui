import { getElementAttrs, attributes } from "./index.js";

// :: NodeSpec A blockquote (`<blockquote>`) wrapping one or more blocks.
export const blockquote = {
  content: "text*",
  group: "block",
  defining: true,
  attrs: attributes(),
  parseDOM: [
    {
      tag: "blockquote",
      getAttrs(dom) {
        return getElementAttrs(dom);
      },
    },
  ],
  toDOM(node) {
    return ["blockquote", node.attrs, ["p", 0]];
  },
};
