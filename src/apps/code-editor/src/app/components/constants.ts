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
  { value: "", label: "-- choose a file type --" },
  { value: "snippet", label: "Snippet (html)" },
  { value: "text/css", label: "CSS File (css)" },
  { value: "text/less", label: "LESS File (less)" },
  { value: "text/scss", label: "SCSS File (scss/sass)" },
  { value: "text/javascript", label: "JavaScript File (js)" },
  {
    value: "ajax-json",
    label: "Custom File Type/Endpoint (Mixed Extensions)",
  },
];

export const views = ["snippet", "ajax-json"];
export const stylesheets = ["text/css", "text/less", "text/scss"];
export const scripts = ["text/javascript"];
