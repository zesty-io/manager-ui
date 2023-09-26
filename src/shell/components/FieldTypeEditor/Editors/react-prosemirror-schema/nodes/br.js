import { getElementAttrs, attributes } from "./index.js";

// :: NodeSpec A hard line break, represented in the DOM as `<br>`.
export const br = {
  inline: true,
  group: "inline",
  selectable: false,
  attrs: attributes(),
  parseDOM: [
    {
      tag: "br",
      getAttrs(dom) {
        return getElementAttrs(dom);
      },
    },
  ],
  toDOM(node) {
    return ["br", node.attrs];
  },
};
