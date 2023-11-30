import { getElementAttrs, attributes } from "./index.js";

// :: NodeSpec A code listing. Disallows marks or non-text inline
// nodes by default. Represented as a `<pre>` element with a
// `<code>` element inside of it.
export const code_block = {
  content: "text*",
  marks: "",
  group: "block",
  code: true,
  defining: true,
  attrs: attributes(),
  parseDOM: [
    {
      tag: "pre",
      preserveWhitespace: "full",
      getAttrs(dom) {
        return getElementAttrs(dom);
      },
    },
  ],
  toDOM(node) {
    return ["pre", node.attrs, ["code", 0]];
  },
};
