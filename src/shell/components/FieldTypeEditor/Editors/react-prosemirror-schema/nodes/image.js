import { getElementAttrs, attributes } from "./index.js";
export const image = {
  inline: true,
  attrs: {
    ...attributes(),
    src: {},
    alt: { default: null },
    align: { default: null },
    width: { default: null },
    height: { default: null },
    "data-zuid": { default: null },
  },
  group: "inline",
  draggable: true,
  marks: "floatLeft floatRight",
  parseDOM: [
    {
      // priority: 51, // must be higher than the default image spec
      tag: "img[src]",
      getAttrs(dom) {
        return getElementAttrs(dom);
      },
    },
  ],
  toDOM(node) {
    // Markup returned from an onChange event. i.e. the markup we store to the API
    return ["img", node.attrs];
  },
};
