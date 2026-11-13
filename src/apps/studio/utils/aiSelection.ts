import { AiSelection } from "shell/components/AIDrawer/promptRequest";
import { ElementSlot, InspectorSelection } from "../hooks/studioTypes";
import { resolveLayoutLeaf } from "../hooks/useLayoutReorderState";
import { NO_TAG } from "../components/studioTags";

// The page the AI edits: its view is the file the server matches a
// selection in, and its item is what `{{this.<name>}}` there resolves to.
export type AiSelectionPage = {
  viewZUID: string | undefined;
  itemZUID: string;
};

// Longest element markup sent as context. The server reads only the opening
// tag; the rest tells the model what the element holds.
const MAX_MARKUP_LENGTH = 2000;

// As the server reads them: a background declaration's value, a url() in it,
// and a field bound through `this`.
const BACKGROUND_DECLARATION =
  /(?:^|[;{\s])background(?:-image)?\s*:((?:&#?\w+;|[^;}])*)/gi;
const CSS_URL = /(url\(\s*)(?:"([^"]*)"|'([^']*)'|([^)"'\s]+))\s*\)/gi;
const BOUND_FIELD = /\{\{\s*this\.([A-Za-z0-9_]+)/;

const attributeSlot = (slots: ElementSlot[], attr: string) =>
  slots.find(
    (slot) => slot.kind === "attribute" && (slot.attr || slot.key) === attr
  );

// What the template says, or the page when the slot is bound.
const slotValue = (slot: ElementSlot | undefined) =>
  slot ? (slot.isDynamic ? slot.value : slot.sourceValue ?? slot.value) : "";

const escapeAttribute = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

// How the server compares a URL in the selection with one in the file.
const normalizeSrc = (src: string) =>
  src
    .trim()
    .replace(/&quot;|&#39;|["']/g, "")
    .replace(/&amp;/g, "&");

const isTemplated = (value: string | null) => !!value?.includes("{{");

// The url()s of a style attribute's background declarations, in order.
// Parsley is masked first so its braces and quotes do not end a value.
const backgroundUrls = (style: string | null) => {
  if (!style) return [];
  const masked = style.replace(/\{\{[\s\S]*?\}\}/g, (expression) =>
    "_".repeat(expression.length)
  );
  const urls: string[] = [];
  for (const declaration of masked.matchAll(BACKGROUND_DECLARATION)) {
    const valueStart =
      (declaration.index ?? 0) + declaration[0].length - declaration[1].length;
    for (const url of declaration[1].matchAll(CSS_URL)) {
      const value = url[2] ?? url[3] ?? url[4] ?? "";
      if (!value) continue;
      const quoted = url[2] !== undefined || url[3] !== undefined;
      const start =
        valueStart + (url.index ?? 0) + url[1].length + (quoted ? 1 : 0);
      urls.push(style.slice(start, start + value.length));
    }
  }
  return urls;
};

// The selected element in its view's cached template, addressed the way
// handleLayoutElementAttrUpdate addresses it.
const findTemplateElement = (
  layoutPatch: InspectorSelection["layoutPatch"],
  getTemplateSource: (codeId: string) => string | null
): HTMLElement | null => {
  if (!layoutPatch?.codeId) return null;
  const lookup = resolveLayoutLeaf(
    getTemplateSource(layoutPatch.codeId) || "",
    layoutPatch.layoutId
  );
  if (!lookup) return null;
  if (layoutPatch.isSelf) return lookup.leaf;
  return (
    (lookup.leaf.querySelectorAll(layoutPatch.tagName)[
      layoutPatch.elementIndex
    ] as HTMLElement | undefined) || null
  );
};

// Which of the template's untemplated <img>s with this one's src it is, in
// source order: how the server tells copies of one image apart.
const imgOccurrence = (img: HTMLElement) => {
  const src = img.getAttribute("src");
  if (!src) return 0;
  const sameSrc = Array.from(img.ownerDocument.querySelectorAll("img")).filter(
    (candidate) => {
      const sources = Array.from(
        candidate.closest("picture")?.querySelectorAll("source") || []
      ).map((source) => source.outerHTML);
      return (
        candidate.getAttribute("src") !== null &&
        normalizeSrc(candidate.getAttribute("src") || "") ===
          normalizeSrc(src) &&
        ![candidate.getAttribute("src"), candidate.getAttribute("srcset")]
          .concat(sources)
          .some(isTemplated)
      );
    }
  );
  return Math.max(sameSrc.indexOf(img as HTMLImageElement), 0);
};

// Which of the template's untemplated inline backgrounds with this url it
// is, counting every background url() of every element in source order.
const backgroundOccurrence = (element: HTMLElement, url: string) => {
  let index = 0;
  for (const candidate of Array.from(
    element.ownerDocument.querySelectorAll<HTMLElement>("[style]")
  )) {
    if (candidate === element) return index;
    index += backgroundUrls(candidate.getAttribute("style")).filter(
      (candidateUrl) =>
        !isTemplated(candidateUrl) &&
        normalizeSrc(candidateUrl) === normalizeSrc(url)
    ).length;
  }
  return 0;
};

// The template's markup for an element, without the ids Studio adds, and
// with its content cut short when long. The opening tag is always whole.
const templateMarkup = (element: HTMLElement, keepStyle: boolean) => {
  const clone = element.cloneNode(true) as HTMLElement;
  clone.removeAttribute("data-layout-id");
  if (!keepStyle) clone.removeAttribute("style");
  clone
    .querySelectorAll("[data-layout-id]")
    .forEach((node) => node.removeAttribute("data-layout-id"));
  const markup = clone.outerHTML;
  const inner = clone.innerHTML;
  if (markup.length <= MAX_MARKUP_LENGTH || !inner) return markup;
  const close = `</${clone.localName}>`;
  const open = markup.slice(0, markup.length - inner.length - close.length);
  return `${open}${inner.slice(
    0,
    Math.max(MAX_MARKUP_LENGTH - open.length - close.length, 0)
  )}…${close}`;
};

// The canvas selection as the server's `selection`, or undefined when
// nothing is selected or the selection is not an element. The server
// matches it in the page's view only: a bound image or background by its
// field, any other by its src or background url and occurrence. Outside
// the page's view it is sent without them, as context for "here".
export const buildAiSelection = (
  selection: InspectorSelection | null,
  page: AiSelectionPage,
  getTemplateSource: (codeId: string) => string | null,
  fieldNameByZUID: (fieldZUID: string) => string | undefined
): AiSelection | undefined => {
  if (!selection) return undefined;
  // A text row has no tag of its own; its element is in its layoutPatch.
  const rawTagName = selection.tagName || selection.layoutPatch?.tagName;
  if (!rawTagName || rawTagName === NO_TAG) return undefined;
  const tagName = rawTagName.toLowerCase();
  const target = findTemplateElement(selection.layoutPatch, getTemplateSource);
  const inPageView =
    !!page.viewZUID && selection.layoutPatch?.codeId === page.viewZUID;

  if (tagName === "img") {
    const srcSlot = attributeSlot(selection.slots, "src");
    // A loop or related item's field is not the page's.
    const boundField =
      srcSlot?.isDynamic &&
      srcSlot.fieldZuid &&
      srcSlot.itemZuid === page.itemZUID
        ? fieldNameByZUID(srcSlot.fieldZuid) ?? null
        : null;
    const src = inPageView
      ? slotValue(srcSlot) || target?.getAttribute("src") || ""
      : "";
    const alt = slotValue(attributeSlot(selection.slots, "alt"));
    return {
      tagName,
      outerHTML: `<img${src ? ` src="${escapeAttribute(src)}"` : ""}${
        alt ? ` alt="${escapeAttribute(alt)}"` : ""
      }>`,
      occurrence:
        inPageView && !boundField && target ? imgOccurrence(target) : 0,
      boundField,
    };
  }

  if (!target) {
    return {
      tagName,
      outerHTML: `<${tagName}>`,
      occurrence: 0,
      boundField: null,
    };
  }

  const [url] = inPageView ? backgroundUrls(target.getAttribute("style")) : [];
  const boundField = isTemplated(url ?? null)
    ? url.match(BOUND_FIELD)?.[1] ?? null
    : null;
  return {
    tagName,
    outerHTML: templateMarkup(target, inPageView),
    occurrence:
      url && !isTemplated(url) ? backgroundOccurrence(target, url) : 0,
    boundField,
  };
};
