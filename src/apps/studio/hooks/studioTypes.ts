export type SelectedElement = {
  studioId?: string;
  fieldZuid: string;
  fieldType?: string;
  itemZuid?: string;
  modelZuid?: string;
};

// A single editable slot on an element shown in the Inspector panel — either
// an attribute (e.g. an <img> src/alt) or the element's text content (e.g. an
// <h1>'s inner text). When `isDynamic`, the slot is bound to a content field
// and carries the zuids needed to open the field editor; otherwise it's a
// static value read straight off the rendered element. `layoutEditable` marks
// whether the slot can be edited in layout mode (i.e. we can read the template
// we'd be rewriting).
//
// This is a STRUCTURAL description only — the bridge reports what an element
// has, the app decides what to call it. Human-facing copy (slot labels, boolean
// option labels) lives in StudioInspectorPanel, so renaming a field never needs
// a bridge redeploy.
export type ElementSlot = {
  kind: "attribute" | "text";
  // Stable per-slot id within an element: the attribute name, or "text". Also
  // the key the panel labels the slot by.
  key: string;
  // Set for kind === "attribute".
  attr?: string;
  isDynamic: boolean;
  // Two views of the same slot, because the modes want different things:
  //   value       — the RESOLVED value off the rendered page (content mode)
  //   sourceValue — the RAW value in the template (layout mode), which may be a
  //                 Parsley expression like "{{this.title}}"
  // Layout mode edits the template, so it must never show or write `value` —
  // that would bake the rendered output over the binding.
  value: string;
  sourceValue?: string;
  layoutEditable: boolean;
  // How the slot is edited. "text" (default) = free-text input; "select" = a
  // dropdown the panel builds (today: a boolean attribute's on/off options).
  control?: "text" | "select";
  // A boolean HTML attribute (presence = on) written by toggling, not by value.
  booleanAttr?: boolean;
  // For kind === "text": which of the element's own text runs this is. Set only
  // when the run is addressable — the bridge proved the template and the render
  // agree, so index N here is index N in the source. Absent means the text is
  // written whole (a dynamic leaf) or isn't addressable at all.
  textIndex?: number;
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

// The <a> that wraps a selected element, as the Inspector's Link section sees
// it. Both values are read off the TEMPLATE, so `href` may be a raw Parsley
// expression rather than a URL.
export type LinkWrapper = {
  href: string;
  // "" when the attribute is absent; "_blank" opens a new tab.
  target: string;
};

// Everything the Link section needs about an element's surroundings. Derived
// from the cached template on every read rather than stored: the wrapper has no
// data-layout-id of its own (layout ids are minted by the render pipeline and
// stripped before save), so it is only ever addressed as the parent of the
// element the panel already has coordinates for.
export type LinkWrapperState = {
  // The <a> immediately wrapping the element, when there is one.
  wrapper: LinkWrapper | null;
  // False when the element is already a link, or sits inside one further up:
  // nested <a> is invalid HTML, and the enclosing link is the one to edit.
  canWrap: boolean;
};

// Where a Parsley reference resolves from when it is NOT `this` — i.e. a field
// on some other content item, pinned to that exact item by ZUID. Carries both
// the Parsley identity (modelName + itemZUID are the only two things that reach
// the template) and the ZUID/labels the panel needs to fetch and display it.
export type ConnectSource = {
  // ContentModel.name — the Parsley reference name, NOT ContentModel.label.
  modelName: string;
  // ContentModel.ZUID — needed to fetch that model's fields.
  modelZUID: string;
  // The specific content item the reference is pinned to.
  itemZUID: string;
  // Display only. Absent when the source was resolved back out of a template
  // string, until the model/field lookup lands.
  modelLabel?: string;
  itemLabel?: string;
};

// A content field offered in the Inspector's "Connect Item" dropdown. Picking
// one writes its Parsley reference into a text slot.
export type ConnectField = {
  // Parsley reference key — what goes in `{{this.<name>}}`.
  name: string;
  // Display name shown in the dropdown.
  label: string;
  // Zesty datatype, used for the row's icon + description.
  datatype: string;
  // Absent => `{{this.<name>}}` (a field on the item rendering the region).
  // Present => `{{<modelName>.filter(<itemZUID>).<name>}}`.
  source?: ConnectSource;
};

// The element whose slots are shown in the right-side Inspector panel.
export type InspectorSelection = {
  nodeId: string;
  tagName: string;
  slots: ElementSlot[];
  layoutPatch?: ElementLayoutPatch | null;
  // Whether the Link controls belong on this row. An element row owns them; a
  // text/field row owns them only when it is its element's LONE content row,
  // since every run of a leaf carries the same element-addressing layoutPatch
  // and wrapping from one of several would swallow content the panel isn't
  // showing. Derived from the tree, not from the template — see
  // ownsElementLinkControls.
  ownsLinkControls?: boolean;
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
  // Set when a "field" binds an element attribute rather than inline text.
  // `attr` is the bound attribute, `hostTag` the element it sits on. Only
  // emitted for bindings the Inspector does NOT surface (a bound `href` on an
  // <a>, say) — a bound <img> src is reachable from the image's own panel and
  // so gets no row at all.
  attr?: string;
  hostTag?: string;
  // Rendered content text for "field" / "text" nodes (the bridge resolves
  // dynamic markers to their actual value).
  label?: string;
  // Editable slots (attributes and/or text) surfaced in the Inspector panel
  // for supported element tags (e.g. <img>, <h1>). Present on "element" nodes.
  slots?: ElementSlot[];
  // Layout-mode patch coordinates for an editable element node.
  layoutPatch?: ElementLayoutPatch | null;
  children: LayersTreeNode[];
};

export type LayersDropPosition = "before" | "after" | "inside";
