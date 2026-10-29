import { AiSelection } from "shell/components/AIDrawer/promptRequest";
import { ElementSlot, InspectorSelection } from "../hooks/studioTypes";
import { resolveLayoutLeaf } from "../hooks/useLayoutReorderState";

const attributeSlot = (slots: ElementSlot[], attr: string) =>
  slots.find(
    (slot) => slot.kind === "attribute" && (slot.attr || slot.key) === attr
  );

// What the template says, or the page when the slot is bound.
const slotValue = (slot: ElementSlot | undefined) =>
  slot ? (slot.isDynamic ? slot.value : slot.sourceValue ?? slot.value) : "";

const escapeAttribute = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

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

// Which of the template's <img>s with this one's literal src it is, in
// source order: how the server tells copies of one image apart. A templated
// src is never matched by src, so it is 0.
const imgOccurrence = (img: HTMLElement) => {
  const src = img.getAttribute("src");
  if (!src || src.includes("{{")) return 0;
  const sameSrc = Array.from(img.ownerDocument.querySelectorAll("img")).filter(
    (candidate) => candidate.getAttribute("src") === src
  );
  return Math.max(sameSrc.indexOf(img as HTMLImageElement), 0);
};

// The template's markup for an element, without the ids Studio adds.
const templateMarkup = (element: HTMLElement) => {
  const clone = element.cloneNode(true) as HTMLElement;
  clone.removeAttribute("data-layout-id");
  clone
    .querySelectorAll("[data-layout-id]")
    .forEach((node) => node.removeAttribute("data-layout-id"));
  return clone.outerHTML;
};

// The canvas selection as the server's `selection`, or undefined when
// nothing is selected. A bound <img> is named by its field, any other by its
// src and occurrence. Another element is sent with its markup, as context
// for "here"; the server also matches a background in its style.
export const buildAiSelection = (
  selection: InspectorSelection | null,
  getTemplateSource: (codeId: string) => string | null,
  fieldNameByZUID: (fieldZUID: string) => string | undefined
): AiSelection | undefined => {
  if (!selection) return undefined;
  const tagName = selection.tagName.toLowerCase();
  const target = findTemplateElement(selection.layoutPatch, getTemplateSource);

  if (tagName === "img") {
    const srcSlot = attributeSlot(selection.slots, "src");
    const boundField =
      srcSlot?.isDynamic && srcSlot.fieldZuid
        ? fieldNameByZUID(srcSlot.fieldZuid) ?? null
        : null;
    const src = slotValue(srcSlot) || target?.getAttribute("src") || "";
    const alt = slotValue(attributeSlot(selection.slots, "alt"));
    return {
      tagName,
      outerHTML: `<img src="${escapeAttribute(src)}"${
        alt ? ` alt="${escapeAttribute(alt)}"` : ""
      }>`,
      occurrence: !boundField && target ? imgOccurrence(target) : 0,
      boundField,
    };
  }

  const style = slotValue(attributeSlot(selection.slots, "style"));
  return {
    tagName,
    outerHTML: target
      ? templateMarkup(target)
      : `<${tagName}${style ? ` style="${escapeAttribute(style)}"` : ""}>`,
    occurrence: 0,
    boundField: null,
  };
};
