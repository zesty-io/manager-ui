import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export interface TreeItem {
  ZUID: string;
  children: TreeItem[];
  contentModelZUID: string;
  icon: JSX.Element | IconDefinition;
  label: string;
  path: string;
  sort: number;
  type:
    | "pageset"
    | "dataset"
    | "item"
    | "internal"
    | "external"
    | "templateset";
  hidden?: boolean;
  closed?: boolean;
}

export interface NavData {
  nav: TreeItem[];
  headless: TreeItem[];
  hidden: TreeItem[];
  raw: TreeItem[];
}
