import { getElementAttrs } from "./index.js";
export const script = {
  group: "inline", // Allow this node to be child of paragraph
  inline: true,
  attrs: {
    src: { default: null },
    type: { default: "text/javascript" },
    async: { default: null },
  },
  parseDOM: [
    {
      tag: "script",
      getAttrs(dom) {
        return getElementAttrs(dom);
      },
    },
  ],
  toDOM(node) {
    /**
    In order to prevent insertion of a script tag view dom methods, which
    causes the loading to the javascript from the script tag src. We create
    a temp element which we then pull the `string` of innerHTML and set a wrapping
    elements innerHTML.

    @see https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML#Security_considerations
    **/
    const script = document.createElement("script");
    script.src = node.attrs.src;
    script.type = node.attrs.type;
    script.async = node.attrs.async;

    const temp = document.createElement("span");
    temp.appendChild(script);

    const wrap = document.createElement("span");
    wrap.innerHTML = temp.innerHTML;

    return wrap;
  },
};
