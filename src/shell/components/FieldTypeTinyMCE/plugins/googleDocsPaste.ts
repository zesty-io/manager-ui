import tinymce from "tinymce/tinymce";

const DOCS_GUID_PATTERN = /id=["']docs-internal-guid-/i;
const BLOCK_SELECTOR = "p, h1, h2, h3, h4, h5, h6";
// Inline wrappers Docs puts around empty lines. Anything else (img, a, etc.)
// means the block has real content and must be kept.
const EMPTY_SAFE_TAGS = new Set(["BR", "B", "STRONG", "I", "EM", "U", "SPAN"]);

const isGoogleDocsPaste = (html: string) => DOCS_GUID_PATTERN.test(html ?? "");

// Attributes worth keeping on pasted content. Everything else (style, class,
// dir, id, role, aria-*, data-*) is Docs formatting and gets dropped.
const KEPT_ATTRIBUTES: Record<string, string[]> = {
  A: ["href", "target", "rel", "title"],
  IMG: ["src", "alt", "title", "width", "height"],
  TD: ["colspan", "rowspan"],
  TH: ["colspan", "rowspan"],
  OL: ["start"],
};

const unwrap = (el: Element) => {
  const parent = el.parentNode;
  if (!parent) return;
  while (el.firstChild) {
    parent.insertBefore(el.firstChild, el);
  }
  parent.removeChild(el);
};

const wrapChildren = (el: Element, tag: string) => {
  const wrapper = el.ownerDocument.createElement(tag);
  while (el.firstChild) {
    wrapper.appendChild(el.firstChild);
  }
  el.appendChild(wrapper);
};

/**
 * Docs expresses emphasis as <span style="font-weight:700">. Convert it to
 * semantic tags first so it survives the style strip. Bold inside headings and
 * underline inside links are skipped since they are just Docs defaults.
 */
const convertStyledSpans = (root: HTMLElement) => {
  root.querySelectorAll<HTMLElement>("span[style]").forEach((span) => {
    const { fontWeight, fontStyle, textDecorationLine, textDecoration } =
      span.style;
    const decoration = textDecorationLine || textDecoration || "";
    const inHeading = !!span.closest("h1, h2, h3, h4, h5, h6");
    const inLink = !!span.closest("a");
    const isBold =
      fontWeight === "bold" || (parseInt(fontWeight, 10) || 0) >= 600;

    if (span.style.verticalAlign === "super") wrapChildren(span, "sup");
    if (span.style.verticalAlign === "sub") wrapChildren(span, "sub");
    if (decoration.includes("line-through")) wrapChildren(span, "s");
    if (decoration.includes("underline") && !inLink) wrapChildren(span, "u");
    if (fontStyle === "italic") wrapChildren(span, "em");
    if (isBold && !inHeading) wrapChildren(span, "strong");
  });
};

const stripFormatting = (root: HTMLElement) => {
  root.querySelectorAll("*").forEach((el) => {
    const kept = KEPT_ATTRIBUTES[el.tagName] ?? [];
    Array.from(el.attributes).forEach((attr) => {
      if (!kept.includes(attr.name)) {
        el.removeAttribute(attr.name);
      }
    });
  });
  // Spans carry nothing once their attributes are gone
  root.querySelectorAll("span").forEach((span) => unwrap(span));
};

const isEmptyBlock = (el: Element) => {
  if ((el.textContent ?? "").replace(/\u00a0/g, " ").trim() !== "") {
    return false;
  }
  return Array.from(el.querySelectorAll("*")).every((child) =>
    EMPTY_SAFE_TAGS.has(child.tagName)
  );
};

/**
 * Cleans Google Docs paste: drops the docs-internal-guid wrapper and all
 * inline styling/attributes (keeping bold, italic, underline, links, lists,
 * headings), unwraps <p> inside <li>, and removes empty <br>-only blocks and
 * trailing <br> in paragraphs. Mutates the pasted DOM in place.
 */
const cleanGoogleDocsPaste = (root: HTMLElement) => {
  convertStyledSpans(root);

  // Docs puts the guid id on a <b>/<span> wrapper, or directly on the first
  // block (e.g. an <h1>). Only unwrap real wrappers, the id on a block is
  // removed with the other attributes below.
  root
    .querySelectorAll(
      'b[id^="docs-internal-guid-"], span[id^="docs-internal-guid-"]'
    )
    .forEach((el) => unwrap(el));

  stripFormatting(root);

  root.querySelectorAll("li > p").forEach((p) => unwrap(p));

  root.querySelectorAll(BLOCK_SELECTOR).forEach((block) => {
    if (isEmptyBlock(block)) {
      block.remove();
    }
  });

  root.querySelectorAll("p").forEach((p) => {
    while (p.lastChild?.nodeName === "BR") {
      p.removeChild(p.lastChild);
    }
  });

  // Blank lines the author typed between blocks arrive as bare top-level
  // <br>s. Group each run into one <p> of <br>s (what PowerPaste outputs),
  // and drop the trailing one Docs always appends.
  while (root.lastChild?.nodeName === "BR") {
    root.removeChild(root.lastChild);
  }
  let blank: HTMLParagraphElement | null = null;
  Array.from(root.childNodes).forEach((node) => {
    if (node.nodeName !== "BR") {
      blank = null;
      return;
    }
    if (!blank) {
      blank = root.ownerDocument.createElement("p");
      node.before(blank);
    }
    blank.appendChild(node);
  });
  // A lone <br> serializes to an empty <p></p> that collapses on the page,
  // so use &nbsp; for single blank lines (PowerPaste does the same)
  root.querySelectorAll(":scope > p").forEach((p) => {
    if (p.childNodes.length === 1 && p.firstChild?.nodeName === "BR") {
      p.innerHTML = "&nbsp;";
    }
  });
};

tinymce.PluginManager.add("googleDocsPaste", (editor) => {
  let isDocsPaste = false;

  // Flag Docs pastes up front, the wrapper id may not survive to postprocess
  editor.on("PastePreProcess", (evt) => {
    isDocsPaste = isGoogleDocsPaste(evt.content);
  });

  editor.on("PastePostProcess", (evt) => {
    if (isDocsPaste) {
      cleanGoogleDocsPaste(evt.node as HTMLElement);
      isDocsPaste = false;
    }
  });
});
