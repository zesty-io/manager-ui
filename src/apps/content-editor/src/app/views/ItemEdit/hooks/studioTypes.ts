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
