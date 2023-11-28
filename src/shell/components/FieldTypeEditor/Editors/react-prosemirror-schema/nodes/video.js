import { getElementAttrs, attributes } from "./index.js";
export const video = {
  defining: true,
  content: "inline*",
  group: "block",
  draggable: true,
  marks: "floatLeft floatRight",
  attrs: {
    ...attributes(),

    src: { default: null },
    autoplay: { default: null },
    buffered: { default: null },
    controls: { default: true },
    height: { default: null },
    loop: { default: null },
    muted: { default: null },
    preload: { default: null },
    poster: { default: null },
    playsinline: { default: null },
    width: { default: null },

    "data-zuid": { default: null },
  },
  parseDOM: [
    {
      tag: "video",
      getAttrs(dom) {
        return getElementAttrs(dom);
      },
    },
  ],
  toDOM(node) {
    return ["video", node.attrs, 0];
  },
};

export const source = {
  inline: true,
  attrs: {
    ...attributes(),
    src: {},
    type: { default: null },
  },
  group: "inline",
  marks: "",
  parseDOM: [
    {
      tag: "source[src]", // must have a src attribute
      getAttrs(dom) {
        return getElementAttrs(dom);
      },
    },
  ],
  toDOM(node) {
    return ["source", node.attrs];
  },
};
