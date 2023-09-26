import { orderedList, bulletList, listItem } from "prosemirror-schema-list";

export const ordered_list = {
  ...orderedList,
  content: "list_item+",
  group: "block",
};
export const bullet_list = {
  ...bulletList,
  content: "list_item+",
  group: "block",
};
export const list_item = {
  ...listItem,
  content: "paragraph block*",
  group: "block",
};
