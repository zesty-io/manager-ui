import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

interface TreeItemBase {
  ZUID: string;
  children: TreeItem[];
  contentModelZUID: string;
  label: string;
  path: string;
  sort: number;
  hidden?: boolean;
  closed?: boolean;
}
type WithMuiIcons = TreeItemBase & {
  type: "pageset" | "templateset" | "dataset" | "item";
  icon: JSX.Element;
};
type WithFAIcons = TreeItemBase & {
  type: "internal" | "external";
  icon: IconDefinition;
};
type WithLegacyIcon = TreeItemBase & {
  type: "directory";
  icon: string;
};
export type TreeItem = WithMuiIcons | WithFAIcons | WithLegacyIcon;
