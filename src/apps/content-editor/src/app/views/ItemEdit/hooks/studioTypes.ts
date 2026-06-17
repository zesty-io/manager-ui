export type SelectedElement = {
  studioId?: string;
  fieldZuid: string;
  fieldType?: string;
  itemZuid?: string;
  modelZuid?: string;
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
  children: LayersTreeNode[];
};

export type LayersDropPosition = "before" | "after" | "inside";
