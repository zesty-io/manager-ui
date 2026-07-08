export type SelectedElement = {
  studioId?: string;
  fieldZuid: string;
  fieldType?: string;
  itemZuid?: string;
  modelZuid?: string;
};

// A single editable slot on an element shown in the Attributes panel — either
// an attribute (e.g. an <img> src/alt) or the element's text content (e.g. an
// <h1>'s inner text). When `isDynamic`, the slot is bound to a content field
// and carries the zuids needed to open the field editor; otherwise it's a
// static value read straight off the rendered element. `layoutEditable` marks
// whether the slot can be edited as free text in layout mode (attributes: the
// element is addressable; text: it's a statically-editable pure-text leaf).
export type ElementSlot = {
  kind: "attribute" | "text";
  // Stable per-slot id within an element: the attribute name, or "text".
  key: string;
  // Set for kind === "attribute".
  attr?: string;
  label: string;
  isDynamic: boolean;
  value: string;
  layoutEditable: boolean;
  // How the slot is edited. "text" (default) = free-text input; "select" = a
  // dropdown of `options` (e.g. a boolean video attribute).
  control?: "text" | "select";
  options?: { value: string; label: string }[];
  // A boolean HTML attribute (presence = on) written by toggling, not by value.
  booleanAttr?: boolean;
  studioId?: string;
  fieldZuid?: string;
  fieldType?: string;
  itemZuid?: string;
  modelZuid?: string;
};

// Coordinates the host needs to patch an element's attribute back into the
// cached template source in layout mode. `null` when the element can't be
// addressed to a code region (no enclosing [data-layout-id]). Addressing is
// tag-agnostic: `layoutId` locates the nearest layout region, then the element
// is either that region node itself (`isSelf`) or the `elementIndex`-th
// `tagName` descendant of it.
export type ElementLayoutPatch = {
  codeId: string | null;
  layoutId: string;
  isSelf: boolean;
  tagName: string;
  elementIndex: number;
};

// The element whose slots are shown in the right-side Attributes panel.
export type SelectedAttributeElement = {
  nodeId: string;
  tagName: string;
  slots: ElementSlot[];
  layoutPatch?: ElementLayoutPatch | null;
};

export type LayoutBreadcrumbItem = {
  layoutId?: string;
  label: string;
};

export type LayoutSelection = {
  codeId: string;
  layoutId: string;
  breadcrumb: LayoutBreadcrumbItem[];
};

export type InteractionMode = "content" | "layout";

// "element" = an HTML element (collapsible container). "field" = dynamic
// content (a studio field marker) rendered as a text row with a bolt.
// "text" = static text content rendered as a text row.
export type LayersTreeNodeKind = "codeFile" | "element" | "field" | "text";

export type LayersTreeNode = {
  id: string;
  kind: LayersTreeNodeKind;
  tagName: string | null;
  codeId: string | null;
  layoutId: string | null;
  studioId?: string;
  fieldZuid?: string;
  fieldType?: string;
  itemZuid?: string;
  modelZuid?: string;
  // Set when a "field" binds an element attribute (e.g. an <img> src) rather
  // than inline text. `attr` is the bound attribute, `hostTag` the element it
  // sits on — used to pick a content-appropriate icon.
  attr?: string;
  hostTag?: string;
  // Rendered content text for "field" / "text" nodes (the bridge resolves
  // dynamic markers to their actual value).
  label?: string;
  // Editable slots (attributes and/or text) surfaced in the Attributes panel
  // for supported element tags (e.g. <img>, <h1>). Present on "element" nodes.
  slots?: ElementSlot[];
  // Layout-mode patch coordinates for an editable element node.
  layoutPatch?: ElementLayoutPatch | null;
  children: LayersTreeNode[];
};

export type LayersDropPosition = "before" | "after" | "inside";
