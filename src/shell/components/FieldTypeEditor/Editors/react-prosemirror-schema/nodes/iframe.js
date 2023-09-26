import { getElementAttrs, attributes } from "./index.js";
export const iframe = {
  group: "inline", // Allow this node to be child of paragraph
  inline: true,
  attrs: {
    ...attributes(),
    height: { default: null },
    width: { default: null },
    scrolling: { default: null },
    frameborder: { default: "0" },
    allow: { default: null },
    allowfullscreen: { default: null },
    name: { default: null },
    referrerpolicy: { default: null },
    sandbox: { default: null },
    src: { default: null },
    srcdoc: { default: null },

    // Used to track embed service
    "data-service": { default: null },

    // Custom service attributes
    "data-instgrm-payload-id": { default: null },
  },
  parseDOM: [
    {
      tag: "iframe",
      getAttrs(dom) {
        return getElementAttrs(dom);
      },
    },
  ],
  toDOM(node) {
    switch (node.attrs["data-service"]) {
      case "Instagram":
        return [
          "iframe",
          {
            ...node.attrs,
            src:
              node.attrs.src ||
              `https://www.instagram.com/p/${node.attrs.id}/embed/captioned`,
            height: node.attrs.height || "600px",
            width: node.attrs.width || "500px",
          },
        ];
        break;
      case "YouTube":
        return [
          "iframe",
          {
            ...node.attrs,
            src:
              node.attrs.src ||
              `https://www.youtube.com/embed/${node.attrs.id}?modestbranding=1&rel=0`,
            allow:
              node.attrs.allow ||
              "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture",
            allowfullscreen: node.attrs.allowfullscreen || true,
            height: node.attrs.height || "315px",
            width: node.attrs.width || "560px",
          },
        ];
        break;
      case "Twitframe":
        return [
          "iframe",
          {
            ...node.attrs,
            src:
              node.attrs.src ||
              `https://twitframe.com/show?url=${encodeURI(node.attrs.id)}`,
            height: node.attrs.height || "315px",
            width: node.attrs.width || "560px",
          },
        ];
        break;
      default:
        return ["iframe", node.attrs];
    }
  },
};
