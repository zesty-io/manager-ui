export type FileTypes =
  | "text/javascript"
  | "text/less"
  | "text/css"
  | "text/sass"
  | "templateset"
  | "snippet"
  | "404"
  | "ajax-json"
  | "pageset"
  | "ajax-html"
  | "block"
  | "directory";

export type FileNodeProps = {
  ZUID: string;
  status: string;
  contentModelZUID?: string | null;
  contentModelType?: string | null;
  type: FileTypes;
  active: number;
  fileName: string;
  customZNode?: number;
  template: number;
  lastEditedID?: number;
  module?: number;
  plugin?: number;
  version: number;
  createdAt?: string;
  updatedAt?: string;
  synced?: boolean;
  isLive?: boolean;
  publishedVersion: number;
  label: string;
  path: string;
  icon: any;
  parentZUID?: string;
  sort?: number;
  children: FileNodeProps[];
  fileType?: "view" | "stylesheet" | "script";
};

export type NavCodeTypes = Partial<FileNodeProps>;

export type NavCodeProps = {
  raw: NavCodeTypes[];
  tree: NavCodeTypes[];
  stylesheetsTree: NavCodeTypes[];
  scriptsTree: NavCodeTypes[];
};

export const fileTypeOptions = [
  { value: "", label: "code.fileTypeChoose" },
  { value: "snippet", label: "code.fileTypeSnippet" },
  { value: "text/css", label: "code.fileTypeCss" },
  { value: "text/less", label: "code.fileTypeLess" },
  { value: "text/scss", label: "code.fileTypeScss" },
  { value: "text/javascript", label: "code.fileTypeJavaScript" },
  {
    value: "ajax-json",
    label: "code.fileTypeCustomEndpoint",
  },
];

export const views = ["snippet", "ajax-json"];
export const stylesheets = ["text/css", "text/less", "text/scss"];
export const scripts = ["text/javascript"];
