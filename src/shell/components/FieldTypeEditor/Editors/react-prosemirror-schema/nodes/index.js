import tableNodes from "./table.js";
import * as listNodes from "./lists.js";
import { heading } from "./heading.js";
import { iframe } from "./iframe.js";
import { image } from "./image.js";
import { video, source } from "./video.js";
import { paragraph } from "./paragraph.js";
import { script } from "./script.js";
import { blockquote } from "./blockquote.js";
import { code_block } from "./code.js";
import { div } from "./div.js";
import { hr } from "./hr.js";
import { br } from "./br.js";

// NOTE: for some reason I'm not able to export a const variable
// so I'm using a function to provide these default attributes
// maybe something to do with our webpack/babel process???
export function attributes() {
  return {
    accesskey: { default: null },
    autocapitalize: { default: null },
    class: { default: null },

    // We exclude `contenteditable`. This may cause problems with prosemirror?
    contextmenu: { default: null },

    // `data-*` have to be added on a per case basis
    dir: { default: null },
    draggable: { default: null },
    dropzone: { default: null },
    hidden: { default: null },
    id: { default: null },
    inputmode: { default: null },

    // Experimental microdata
    // @see https://html.spec.whatwg.org/multipage/microdata.html#microdata
    itemid: { default: null },
    itemprop: { default: null },
    itemref: { default: null },
    itemscope: { default: null },
    itemtype: { default: null },

    lang: { default: null },
    spellcheck: { default: null },
    style: { default: null },
    tabindex: { default: null },
    title: { default: null },
    translated: { default: null },
  };
}

/**
 * getElementAttrs
 * attrs [NodeList]
 */
export function getElementAttrs(dom) {
  let attrs = {};

  if (dom.attributes.length) {
    for (var i = 0; i < dom.attributes.length; i++) {
      if (dom.attributes[i].value) {
        attrs[dom.attributes[i].name] = dom.attributes[i].value;
      }
    }
  }

  return attrs;
}

// NOTE: Order matters!!!
// @see https://prosemirror.net/docs/guide/#schema.content_expressions
export default {
  // :: NodeSpec The top level document node.
  doc: {
    content: "block+",
  },

  // Block
  paragraph,
  heading,
  blockquote,
  div,
  code_block,
  video,

  // inline
  text: {
    group: "inline",
  },
  image,
  script,
  iframe,
  source,
  hr,
  br,

  // override ProseMirror table schema
  ...tableNodes,

  // override ProseMirror list schema
  ...listNodes,
};
